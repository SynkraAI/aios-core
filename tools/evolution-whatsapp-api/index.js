'use strict';

const { EvolutionClient: BaseClient } = require('./lib/client');
const { MessagesMixin } = require('./lib/messages');
const { InstancesMixin } = require('./lib/instances');
const errors = require('./lib/errors');

// Compose mixins: BaseClient → Messages → Instances
const EvolutionClient = InstancesMixin(MessagesMixin(BaseClient));

module.exports = {
  EvolutionClient,
  ...errors,
};
