import { defineBackend } from '@aws-amplify/backend'; 
import { data } from './data/resource.js';
import { resolverScheduler } from "./functions/resolver/resource.js"

defineBackend({ 
  data,
  resolverScheduler
});
