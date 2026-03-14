'use strict';

const { EvolutionClient: BaseClient } = require('./lib/client');
const { MessagesMixin } = require('./lib/messages');
const { InstancesMixin } = require('./lib/instances');
const { GroupsMixin } = require('./lib/groups');
const jidUtils = require('./lib/jid-utils');
const errors = require('./lib/errors');

// Compose mixins: BaseClient → Messages → Instances → Groups
const EvolutionClient = GroupsMixin(InstancesMixin(MessagesMixin(BaseClient)));

module.exports = {
  EvolutionClient,
  ...jidUtils,
  ...errors,
};
