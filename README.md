# slimevents

一个极简、高性能、完全类型安全的 TypeScript/JavaScript 事件发射器库。小于 1KB，零依赖，为现代前端应用打造。

## ✨ 特性

🎯 完全类型安全 ​ - TypeScript 优先，编译时检查事件名和参数类型  
📦 极简轻量 ​ - 小于 1KB (gzipped)，零依赖  
🚀 高性能 ​ - 使用原生数据结构，无多余开销  
🛡️ 自释放设计 - 监听返回unsubscribe函数，调用它即可直接取消监听，无需记住事件名和回调引用.  
🔧 多种订阅模式 ​ - 支持单个、批量、统一回调等多种订阅方式  
🧪 错误隔离 ​ - 单个监听器错误不影响其他监听器

## 📦 安装

```bash
  # 使用 npm
npm install slimevents

# 使用 yarn
yarn add slimevents

# 使用 pnpm
pnpm add slimevents
```

## 🚀 快速开始

TypeScript 项目

```ts
import {createSlimEvents} from "slimevents";

// 1. 定义事件类型
interface AppEvents {
  "user:login": [username: string, timestamp: number];
  "user:logout": [];
  "notification:show": [message: string, duration?: number];
  "data:loaded": [data: unknown];
  error: [error: Error];
}

// 2. 创建事件发射器
const emitter = createSlimEvents<AppEvents>();

// 3. 监听事件
const unsubscribe = emitter.on("user:login", (username, timestamp) => {
  console.log(`用户 ${username} 在 ${timestamp} 登录`);
});

// 4. 触发事件
emitter.emit("user:login", "张三", Date.now());

// 5. 取消监听
unsubscribe();

// 6. 清除所有监听
emitter.clear();
```

JavaScript 项目

```js
import {createSlimEvents} from "slimevents";

// 直接使用，无需类型定义
const emitter = createSlimEvents();

emitter.on("click", (x, y) => {
  console.log(`点击位置: ${x}, ${y}`);
});

emitter.emit("click", 100, 200);
```

## 📖 API 文档

核心方法

createSlimEvents<Events>()
创建新的事件发射器实例。

```ts
const emitter = createSlimEvents<{
  event1: [arg1: string, arg2: number];
  event2: [];
}>();
```

on<Event>(event, callback)

监听单个事件。

```ts
// 返回取消订阅函数
const unsubscribe = emitter.on("event1", (arg1, arg2) => {
  console.log(arg1, arg2);
});

// 取消这个监听
unsubscribe();
```

once<Event>(event, callback)

单个一次事件。

```ts
// 监听完成后自动取消监听
emitter.once("event1", (arg1, arg2) => {
  console.log(arg1, arg2);
});
```

emit<Event>(event, ...args)

触发事件。

```ts
emitter.emit("event1", "Hello", 123);
emitter.emit("event2"); // 无参数事件
```

onMany(events)

批量监听多个事件。

```ts
// 同时监听多个事件
const unsubscribe = emitter.onMany({
  event1: (arg1, arg2) => {
    /* ... */
  },
  event2: () => {
    /* ... */
  },
});

// 一次性取消所有监听
unsubscribe();
```

onAll(eventNames, callback)

监听多个事件，使用相同的回调函数。

```ts
// 监听多个事件，使用相同处理逻辑
const unsubscribe = emitter.onAll(["click", "tap"], (x, y) => {
  console.log(`触发点击: ${x}, ${y}`);
});
```

clear()

清除所有事件监听器。

```ts
// 清除所有监听，适用于组件卸载等场景
emitter.clear();
```

🎯 高级用法

在 React 中使用

```txs
// useEventEmitter.ts
import { useState, useEffect } from 'react';
import { createSlimEvents } from 'slimevents';

// 定义应用事件
interface AppEvents {
  'theme:change': ['light' | 'dark'];
  'notification:show': [message: string];
  'user:update': [user: User];
}

// 创建全局事件总线
export const eventBus = createSlimEvents<AppEvents>();

// React Hook
export function useEvent<Event extends keyof AppEvents>(
  event: Event,
  callback: (...args: AppEvents[Event]) => void,
  deps: any[] = []
) {
  useEffect(() => {
    const unsubscribe = eventBus.on(event, callback);
    return unsubscribe;  // 组件卸载时自动取消订阅
  }, deps);
}
```

```tsx
// 组件中使用
function UserProfile() {
  useEvent("user:update", (user) => {
    // 更新用户信息
  });

  return <div>用户资料</div>;
}
```

在 Vue 3 中使用

```ts
// eventBus.ts
import {createSlimEvents} from "slimevents";

export interface AppEvents {
  "modal:open": [modalId: string];
  "modal:close": [modalId: string];
  "toast:show": [message: string, type: "success" | "error"];
}

export const eventBus = createSlimEvents<AppEvents>();
```

```ts
 <script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { eventBus } from './eventBus';

onMounted(() => {
  // 监听事件
  const unsubscribe = eventBus.on('modal:open', (modalId) => {
    console.log(`打开弹窗: ${modalId}`);
  });

  // 组件卸载时取消监听
  onUnmounted(() => unsubscribe());
});

// 触发事件
function showToast() {
  eventBus.emit('toast:show', '操作成功', 'success');
}
</script>
```

🔧 实际场景示例
状态管理

```ts
// store.ts
import {createSlimEvents} from "slimevents";

interface StoreEvents<T> {
  "state:change": [newState: T, oldState: T];
  "action:dispatched": [action: string, payload: any];
}

function createStore<T>(initialState: T) {
  let state = initialState;
  const emitter = createSlimEvents<StoreEvents<T>>();

  return {
    getState: () => state,

    setState: (newState: T) => {
      const oldState = state;
      state = newState;
      emitter.emit("state:change", newState, oldState);
    },

    subscribe: (listener: (newState: T, oldState: T) => void) => {
      return emitter.on("state:change", listener);
    },

    dispatch: (action: string, payload?: any) => {
      emitter.emit("action:dispatched", action, payload);
    },
  };
}
```
