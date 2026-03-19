// src/__tests__/index.test.ts
import {describe, it, expect, vi} from "vitest";
import {createSlimEvents} from "../index";

describe("createSlimEvents", () => {
  it("基本 on/emit 功能", () => {
    const events = createSlimEvents();
    const callback = vi.fn();

    const unbind = events.on("test", callback);
    events.emit("test", "data");

    expect(callback).toHaveBeenCalledWith("data");

    unbind();
    events.emit("test", "data2");
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("once一次监听", () => {
    const events = createSlimEvents();
    const callback = vi.fn();

    events.once("test", callback);
    events.emit("test", "data");
    expect(callback).toHaveBeenCalledWith("data");

    events.emit("test", "data2");
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("支持多个监听器", () => {
    const events = createSlimEvents();
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    events.on("test", callback1);
    events.on("test", callback2);
    events.emit("test", "data");

    expect(callback1).toHaveBeenCalledWith("data");
    expect(callback2).toHaveBeenCalledWith("data");
  });

  it("onMany 批量监听", () => {
    const events = createSlimEvents();
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    const unbind = events.onMany({
      event1: callback1,
      event2: callback2,
    });

    events.emit("event1", "data1");
    events.emit("event2", "data2");

    expect(callback1).toHaveBeenCalledWith("data1");
    expect(callback2).toHaveBeenCalledWith("data2");

    unbind();
    events.emit("event1", "data3");
    expect(callback1).toHaveBeenCalledTimes(1);
  });

  it("onAll 共享回调监听", () => {
    const events = createSlimEvents();
    const callback = vi.fn();

    const unbind = events.onAll(["event1", "event2"], callback);

    events.emit("event1", "data1");
    events.emit("event2", "data2");

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenCalledWith("data1");
    expect(callback).toHaveBeenCalledWith("data2");

    unbind();
  });

  it("TypeScript 类型检查", () => {
    // 正确的类型定义
    type MyEvents = {
      login: [userId: string];
      logout: [];
      message: [text: string, from: string];
    };

    const events = createSlimEvents<MyEvents>();
    const loginHandler = vi.fn();
    const messageHandler = vi.fn();

    // 应该通过类型检查
    events.on("login", loginHandler);
    events.on("message", messageHandler);

    events.emit("login", "user123");
    events.emit("logout");
    events.emit("message", "hello", "user123");

    expect(loginHandler).toHaveBeenCalledWith("user123");
    expect(messageHandler).toHaveBeenCalledWith("hello", "user123");
  });

  it("应该忽略非函数值", () => {
    const events = createSlimEvents();
    const callback = vi.fn();

    const unbind = events.onMany({
      event1: callback,
      event2: null as any,
      event3: undefined as any,
    });

    events.emit("event1", "data");
    expect(callback).toHaveBeenCalledWith("data");

    unbind();
  });
});
