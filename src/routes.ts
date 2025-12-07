import { lazy } from 'solid-js';
import type { RouteDefinition } from '@solidjs/router';

import Home from './pages/home';
import AboutData from './pages/about.data';
import BlockchainData from './pages/blockchain.data';
import BlockData from './pages/block.data';

export const routes: RouteDefinition[] = [
  {
    path: '/',
    component: Home,
  },
  {
    path: '/about',
    component: lazy(() => import('./pages/about')),
    data: AboutData,
  },
  {
    path: '/blockchain',
    component: lazy(() => import('./pages/blockchain')),
    data: BlockchainData,
  },
  {
    path: '/block/:identifier',
    component: lazy(() => import('./pages/block')),
    data: BlockData,
  },
  {
    path: '**',
    component: lazy(() => import('./errors/404')),
  },
];
