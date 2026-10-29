/** Route table for the whole app. Add a route here and it is type-checked
 *  everywhere: the navigator, the registry and every push() call. */
export type TabKey = 'home' | 'capture' | 'tabs' | 'library' | 'profile';

export type Route =
  | { name: 'session'; id: string; title: string }
  | { name: 'record'; id: string }
  | { name: 'movie'; id: string }
  | { name: 'series'; id: string }
  | { name: 'book'; id: string }
  | { name: 'settings' };

export type RouteName = Route['name'];
export type RouteProps<K extends RouteName> = Omit<Extract<Route, { name: K }>, 'name'>;

export interface Navigation {
  tab: TabKey;
  setTab: (tab: TabKey) => void;
  depth: number;
  push: (route: Route) => void;
  pop: () => void;
  popToRoot: () => void;
}
