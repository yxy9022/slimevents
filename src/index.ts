export type Unsubscribe = () => void;

//  定义回调函数类型
export type EventCallback<Args extends unknown[]> = (...args: Args) => void;

export interface EventMap {
  [key: string]: unknown[];
}

export interface EventEmitter<Events extends EventMap> {
  on<Event extends keyof Events>(
    event: Event,
    callback: (...args: Events[Event]) => void
  ): Unsubscribe;

  once<Event extends keyof Events>(
    event: Event,
    callback: (...args: Events[Event]) => void
  ): Unsubscribe;

  emit<Event extends keyof Events>(event: Event, ...args: Events[Event]): void;

  onMany<
    EventMap extends Partial<Record<keyof Events, (...args: any[]) => void>>
  >(
    events: EventMap
  ): Unsubscribe;

  onAll<Event extends keyof Events>(
    eventNames: Event[],
    callback: (...args: Events[Event]) => void
  ): Unsubscribe;

  clear(): void;
}

export function createSlimEvents<
  Events extends Record<string, unknown[]>
>(): EventEmitter<Events> {
  // 使用映射类型存储
  const listeners: {
    [K in keyof Events]?: Array<EventCallback<Events[K]>>;
  } = Object.create(null);

  return {
    on<Event extends keyof Events>(
      event: Event,
      callback: EventCallback<Events[Event]>
    ): Unsubscribe {
      (listeners[event] ||= []).push(callback);

      return () => {
        const arr = listeners[event];
        if (arr) {
          const idx = arr.indexOf(callback);
          if (idx > -1) arr.splice(idx, 1);
          if (arr.length === 0) delete listeners[event];
        }
      };
    },

    once<Event extends keyof Events>(
      event: Event,
      callback: EventCallback<Events[Event]>
    ): Unsubscribe {
      const wrappedCallback: EventCallback<Events[Event]> = (...args) => {
        unsubscribe();
        callback(...args);
      };

      (listeners[event] ||= []).push(wrappedCallback);

      const unsubscribe = () => {
        const arr = listeners[event];
        if (arr) {
          const idx = arr.indexOf(wrappedCallback);
          if (idx > -1) arr.splice(idx, 1);
          if (arr.length === 0) delete listeners[event];
        }
      };

      return unsubscribe;
    },

    emit<Event extends keyof Events>(
      event: Event,
      ...args: Events[Event]
    ): void {
      const callbacks = listeners[event];
      if (!callbacks || callbacks.length === 0) return;

      // 创建副本避免循环变化
      const toCall = callbacks.slice();
      for (let i = 0; i < toCall.length; i++) {
        try {
          toCall[i](...args);
        } catch (e) {
          console.error(e);
        }
      }
    },

    onMany(events) {
      const unbinds: Unsubscribe[] = [];
      for (const key in events) {
        const fn = events[key];
        if (typeof fn === "function") unbinds.push(this.on(key as any, fn));
      }
      return () => {
        for (let i = 0; i < unbinds.length; i++) unbinds[i]();
      };
    },

    onAll(eventNames, callback) {
      const unbinds: Unsubscribe[] = [];
      for (let i = 0; i < eventNames.length; i++) {
        unbinds.push(this.on(eventNames[i], callback));
      }
      return () => {
        for (let i = 0; i < unbinds.length; i++) unbinds[i]();
      };
    },

    clear() {
      // 清空所有监听器
      for (const key in listeners) {
        delete listeners[key];
      }
    },
  };
}

export default createSlimEvents;
