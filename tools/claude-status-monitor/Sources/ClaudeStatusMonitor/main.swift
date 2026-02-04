import Cocoa
import Foundation
import UserNotifications

// MARK: - Status Model

struct ClaudeStatus: Codable {
    let state: StatusState
    let timestamp: String
    let lastActivity: String
    let message: String
    let context: String

    enum StatusState: String, Codable {
        case idle
        case running
        case waiting

        var displayName: String {
            switch self {
            case .idle: return "Idle"
            case .running: return "Rodando"
            case .waiting: return "Aguardando"
            }
        }

        var icon: String {
            switch self {
            case .idle, .running: return "🟢"
            case .waiting: return "🔴"
            }
        }
    }
}

// MARK: - File Watcher

class FileWatcher {
    private let filePath: String
    private var fileDescriptor: CInt = -1
    private var source: DispatchSourceFileSystemObject?
    private let queue = DispatchQueue(label: "com.synkra.aios.filewatcher")

    var onFileChanged: (() -> Void)?

    init(filePath: String) {
        self.filePath = filePath
    }

    func startWatching() {
        // Create file if it doesn't exist
        if !FileManager.default.fileExists(atPath: filePath) {
            let directory = (filePath as NSString).deletingLastPathComponent
            try? FileManager.default.createDirectory(atPath: directory, withIntermediateDirectories: true)

            let initialStatus = ClaudeStatus(
                state: .idle,
                timestamp: ISO8601DateFormatter().string(from: Date()),
                lastActivity: ISO8601DateFormatter().string(from: Date()),
                message: "Aguardando Claude Code iniciar...",
                context: ""
            )

            if let data = try? JSONEncoder().encode(initialStatus) {
                try? data.write(to: URL(fileURLWithPath: filePath))
            }
        }

        fileDescriptor = open(filePath, O_EVTONLY)
        guard fileDescriptor != -1 else {
            print("Error: Could not open file at \(filePath)")
            return
        }

        source = DispatchSource.makeFileSystemObjectSource(
            fileDescriptor: fileDescriptor,
            eventMask: [.write, .delete, .rename],
            queue: queue
        )

        source?.setEventHandler { [weak self] in
            self?.onFileChanged?()
        }

        source?.setCancelHandler { [weak self] in
            guard let self = self else { return }
            close(self.fileDescriptor)
        }

        source?.resume()
        print("Started watching: \(filePath)")
    }

    func stopWatching() {
        source?.cancel()
        source = nil
    }

    deinit {
        stopWatching()
    }
}

// MARK: - Notification Manager

class NotificationManager: NSObject, UNUserNotificationCenterDelegate {
    static let shared = NotificationManager()

    private override init() {
        super.init()
        setupNotifications()
    }

    private func setupNotifications() {
        let center = UNUserNotificationCenter.current()
        center.delegate = self

        center.requestAuthorization(options: [.alert, .sound]) { granted, error in
            if granted {
                print("Notification permission granted")
            } else if let error = error {
                print("Notification permission error: \(error)")
            }
        }
    }

    func sendNotification(title: String, body: String, sound: Bool = true) {
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        if sound {
            content.sound = .default
        }

        let request = UNNotificationRequest(
            identifier: UUID().uuidString,
            content: content,
            trigger: nil
        )

        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                print("Error sending notification: \(error)")
            }
        }
    }

    // UNUserNotificationCenterDelegate
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        completionHandler([.banner, .sound])
    }
}

// MARK: - Status Bar Controller

class StatusBarController {
    private var statusItem: NSStatusItem
    private let menu = NSMenu()
    private var currentStatus: ClaudeStatus?
    private var fileWatcher: FileWatcher
    private let statusFilePath: String

    init() {
        // Determine status file path
        let homeDir = FileManager.default.homeDirectoryForCurrentUser.path
        let projectRoot = "\(homeDir)/aios-core"
        statusFilePath = "\(projectRoot)/.aios/claude-status.json"

        // Create status item
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)

        // Setup file watcher (before using self)
        fileWatcher = FileWatcher(filePath: statusFilePath)

        // Now we can use self
        if let button = statusItem.button {
            button.title = "🟢"
            button.target = self
            button.action = #selector(statusItemClicked)
        }

        fileWatcher.onFileChanged = { [weak self] in
            DispatchQueue.main.async {
                self?.updateStatus()
            }
        }

        // Setup menu
        setupMenu()

        // Start watching
        fileWatcher.startWatching()

        // Initial update
        updateStatus()

        // Poll every 2 seconds as backup
        Timer.scheduledTimer(withTimeInterval: 2.0, repeats: true) { [weak self] _ in
            self?.updateStatus()
        }
    }

    private func setupMenu() {
        menu.removeAllItems()

        let statusMenuItem = NSMenuItem(title: "Status: Carregando...", action: nil, keyEquivalent: "")
        statusMenuItem.tag = 100
        menu.addItem(statusMenuItem)

        let timeMenuItem = NSMenuItem(title: "Última atualização: --", action: nil, keyEquivalent: "")
        timeMenuItem.tag = 101
        menu.addItem(timeMenuItem)

        menu.addItem(NSMenuItem.separator())

        let messageMenuItem = NSMenuItem(title: "", action: nil, keyEquivalent: "")
        messageMenuItem.tag = 102
        menu.addItem(messageMenuItem)

        menu.addItem(NSMenuItem.separator())

        menu.addItem(NSMenuItem(title: "Abrir arquivo de status", action: #selector(openStatusFile), keyEquivalent: "o"))
        menu.addItem(NSMenuItem(title: "Atualizar agora", action: #selector(forceUpdate), keyEquivalent: "r"))

        menu.addItem(NSMenuItem.separator())

        menu.addItem(NSMenuItem(title: "Sair", action: #selector(quit), keyEquivalent: "q"))

        statusItem.menu = menu
    }

    @objc private func statusItemClicked() {
        // Menu opens automatically
    }

    private func updateStatus() {
        guard let data = try? Data(contentsOf: URL(fileURLWithPath: statusFilePath)) else {
            setErrorState()
            return
        }

        guard let status = try? JSONDecoder().decode(ClaudeStatus.self, from: data) else {
            setErrorState()
            return
        }

        let previousStatus = currentStatus
        currentStatus = status

        // Update status bar icon
        if let button = statusItem.button {
            button.title = status.state.icon
        }

        // Update menu
        if let statusMenuItem = menu.item(withTag: 100) {
            statusMenuItem.title = "Status: \(status.state.displayName)"
        }

        if let timeMenuItem = menu.item(withTag: 101) {
            let formatter = ISO8601DateFormatter()
            if let date = formatter.date(from: status.timestamp) {
                let displayFormatter = DateFormatter()
                displayFormatter.dateStyle = .none
                displayFormatter.timeStyle = .medium
                timeMenuItem.title = "Última atualização: \(displayFormatter.string(from: date))"
            }
        }

        if let messageMenuItem = menu.item(withTag: 102) {
            messageMenuItem.title = status.message.isEmpty ? "Sem mensagem" : status.message
        }

        // Send notification if state changed to waiting
        if previousStatus?.state != .waiting && status.state == .waiting {
            NotificationManager.shared.sendNotification(
                title: "Claude está aguardando",
                body: status.message.isEmpty ? "Claude Code precisa da sua atenção" : status.message
            )
        }
    }

    private func setErrorState() {
        if let button = statusItem.button {
            button.title = "⚠️"
        }

        if let statusMenuItem = menu.item(withTag: 100) {
            statusMenuItem.title = "Status: Erro ao ler arquivo"
        }
    }

    @objc private func openStatusFile() {
        NSWorkspace.shared.open(URL(fileURLWithPath: statusFilePath))
    }

    @objc private func forceUpdate() {
        updateStatus()
    }

    @objc private func quit() {
        NSApplication.shared.terminate(nil)
    }
}

// MARK: - App Delegate

class AppDelegate: NSObject, NSApplicationDelegate {
    var statusBarController: StatusBarController?

    func applicationDidFinishLaunching(_ notification: Notification) {
        // Initialize notification manager
        _ = NotificationManager.shared

        // Create status bar controller
        statusBarController = StatusBarController()

        print("Claude Status Monitor started")
    }
}

// MARK: - Main

let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate

// Hide dock icon
app.setActivationPolicy(.accessory)

// Run app
app.run()
