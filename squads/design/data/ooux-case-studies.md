# OOUX Case Studies

**ID:** ooux-case-studies
**Version:** 1.0
**Purpose:** Object-Oriented UX case studies demonstrating the ORCA methodology applied to real-world projects across domains
**Maintained By:** @sophia-prater

---

## What is OOUX / ORCA?

ORCA stands for **Objects, Relationships, CTAs (Calls to Action), and Attributes**. It is a methodology for structuring UX design around the real-world objects users think about, rather than pages or features.

---

## Case Study 1: E-Commerce Marketplace

**Domain:** Multi-vendor e-commerce platform
**Challenge:** Navigation was page-based (Home, Shop, Cart, Account) with 200+ product categories causing deep nesting and user confusion.

| ORCA Element | Details |
|-------------|---------|
| **Objects** | Product, Cart, Order, Seller, Review, Category, Wishlist |
| **Relationships** | Product belongs-to Seller; Product has-many Reviews; Cart contains Products; Order derives-from Cart |
| **CTAs** | Product: Add to Cart, Save to Wishlist, Compare; Cart: Checkout, Remove Item; Order: Track, Return |
| **Attributes** | Product: name, price, rating, images, availability; Order: status, tracking, total, date |

**Before (Page-Based):** Users navigated Home > Category > Subcategory > Product > Cart > Checkout with 6+ clicks to purchase.
**After (Object-Based):** Product object is the central hub. Users access Reviews, Seller info, and Cart actions directly from the Product context. Cart is persistent and accessible from any screen.

**Outcome:** 34% reduction in time-to-purchase, 18% increase in conversion rate.

---

## Case Study 2: SaaS Project Management

**Domain:** Team collaboration and project tracking tool
**Challenge:** Feature-creep led to a toolbar with 40+ actions. Users could not find basic functions.

| ORCA Element | Details |
|-------------|---------|
| **Objects** | Project, Task, Member, Sprint, Comment, Attachment, Label |
| **Relationships** | Project has-many Tasks; Task assigned-to Member; Task belongs-to Sprint; Task has-many Comments |
| **CTAs** | Project: Create Task, Invite Member, View Board; Task: Assign, Move to Sprint, Add Comment, Change Status; Member: View Tasks, Set Role |
| **Attributes** | Task: title, status, priority, due date, assignee, estimate; Project: name, description, members, progress |

**Before (Page-Based):** Separate pages for "Tasks," "Team," "Reports," "Settings" with duplicated actions across pages.
**After (Object-Based):** Task object is the atomic unit. All actions (assign, comment, label, move) are available in-context on the Task. Project view aggregates Tasks with multiple layout options (board, list, timeline).

**Outcome:** Onboarding time reduced from 3 days to 4 hours. Support tickets decreased 42%.

---

## Case Study 3: Healthcare Patient Portal

**Domain:** Hospital patient portal for appointments and records
**Challenge:** Patients could not find their test results, upcoming appointments, or provider contact info without navigating 4+ different sections.

| ORCA Element | Details |
|-------------|---------|
| **Objects** | Patient, Appointment, Provider, Test Result, Prescription, Message, Insurance |
| **Relationships** | Patient has-many Appointments; Appointment belongs-to Provider; Patient has-many Test Results; Prescription prescribed-by Provider |
| **CTAs** | Appointment: Reschedule, Cancel, Check In; Provider: Message, View Profile, Book Appointment; Test Result: View Detail, Download PDF, Share with Provider |
| **Attributes** | Appointment: date, time, provider, location, type, status; Provider: name, specialty, availability, rating |

**Before (Page-Based):** "My Health," "Appointments," "Messages," "Billing" as separate silos with no cross-linking.
**After (Object-Based):** Provider object links to their Appointments, Prescriptions, and Messages. Appointment object shows related Test Results and follow-up actions.

**Outcome:** Patient satisfaction score increased from 3.2 to 4.6 out of 5. Call center volume dropped 28%.

---

## Case Study 4: Online Education Platform

**Domain:** University online learning management system
**Challenge:** Students struggled to track progress across courses, find assignments, and access materials.

| ORCA Element | Details |
|-------------|---------|
| **Objects** | Course, Lesson, Assignment, Student, Instructor, Grade, Discussion, Resource |
| **Relationships** | Course has-many Lessons; Lesson has-many Assignments; Student enrolled-in Course; Assignment has Grade; Course has Instructor |
| **CTAs** | Course: Enroll, View Syllabus, Drop; Lesson: Start, Mark Complete, Bookmark; Assignment: Submit, View Feedback, Request Extension |
| **Attributes** | Course: title, instructor, schedule, progress, credits; Lesson: title, duration, type (video/reading/quiz), completion status |

**Before (Page-Based):** Dashboard, Courses, Grades, Calendar, Resources as flat top-level pages. Students needed 5 clicks to submit an assignment.
**After (Object-Based):** Course is the primary container. Lesson objects show inline progress, related Assignments, and Resources. Student dashboard aggregates upcoming Assignments across all Courses.

**Outcome:** Assignment submission rate increased 23%. Average session time decreased 15% (users found content faster).

---

## Case Study 5: Real Estate Listing Platform

**Domain:** Property search and listing management for agents and buyers
**Challenge:** Agents managed listings through a 12-step form wizard. Buyers could not compare properties effectively.

| ORCA Element | Details |
|-------------|---------|
| **Objects** | Property, Agent, Showing, Offer, Neighborhood, Photo Gallery, Floor Plan |
| **Relationships** | Property listed-by Agent; Property located-in Neighborhood; Property has-many Showings; Offer made-on Property |
| **CTAs** | Property: Schedule Showing, Make Offer, Save, Share, Compare; Agent: Contact, View Listings, Read Reviews; Showing: Confirm, Reschedule, Cancel |
| **Attributes** | Property: price, bedrooms, bathrooms, sqft, year built, photos, status; Neighborhood: walkability, schools, transit, median price |

**Before:** Wizard-based listing creation; search results as flat list with no comparison.
**After:** Property object is the hub. Neighborhood object enriches context. Comparison view allows side-by-side Property objects.

**Outcome:** Agent listing creation time reduced from 45 to 12 minutes. Buyer engagement increased 37%.

---

## Before/After: Page-Based vs Object-Based Architecture

| Aspect | Page-Based | Object-Based (OOUX) |
|--------|-----------|---------------------|
| **Navigation model** | Feature silos (Settings, Reports, Users) | Object hubs (Project > Tasks > Members) |
| **Information architecture** | Organized by function | Organized by user mental model |
| **Action placement** | Toolbars, menus, separate pages | In-context on the object |
| **Cross-referencing** | Manual linking between pages | Relationships built into the model |
| **Scalability** | New feature = new page = more navigation | New feature = new CTA or attribute on existing object |
| **Developer handoff** | Wireframes per page | Object model maps directly to data model and API |

---

## Common OOUX Pitfalls

| Pitfall | Description | How to Avoid |
|---------|-------------|--------------|
| **Over-objectification** | Making everything an object, including things that are really attributes | Ask: "Does the user think of this as a standalone thing they interact with?" If no, it is an attribute. |
| **Ignoring relationships** | Identifying objects but not mapping how they connect | Always complete the Relationship step before moving to CTAs. Relationships drive navigation. |
| **CTA overload** | Attaching too many actions to a single object | Prioritize CTAs by frequency. Primary (1-2), Secondary (3-5), Tertiary (hidden in overflow). |
| **Skipping nested objects** | Missing sub-objects that users interact with independently | Ask: "Can this exist without its parent?" If yes, it may be its own object. |
| **System objects as user objects** | Exposing database entities that users do not think about (e.g., "Permission," "Session") | Filter objects through user language. If users do not name it, it is not a user-facing object. |
| **Static object modeling** | Defining objects once and never revisiting as the product evolves | Revisit the object map quarterly or when major features are added. Objects evolve with user needs. |

---

## References

- Sophia Prater, "OOUX: A Foundation for Interaction Design" (ooux.com)
- ORCA Methodology Workshop Materials
- Sophia Prater, "Object Mapping" (A List Apart)
- Rewired podcast episodes on Object-Oriented UX
