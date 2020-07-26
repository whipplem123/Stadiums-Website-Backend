#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { StadiumsWebsiteBackendStack } from '../lib/stadiums-website-backend-stack';

const app = new cdk.App();
new StadiumsWebsiteBackendStack(app, 'StadiumsWebsiteBackendStack');
