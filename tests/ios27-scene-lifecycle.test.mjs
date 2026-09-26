import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const appDelegate = fs.readFileSync(new URL("../ios/App/App/AppDelegate.swift", import.meta.url), "utf8");
const sceneDelegate = fs.readFileSync(new URL("../ios/App/App/SceneDelegate.swift", import.meta.url), "utf8");
const infoPlist = fs.readFileSync(new URL("../ios/App/App/Info.plist", import.meta.url), "utf8");
const project = fs.readFileSync(new URL("../ios/App/App.xcodeproj/project.pbxproj", import.meta.url), "utf8");
const storyboard = fs.readFileSync(new URL("../ios/App/App/Base.lproj/Main.storyboard", import.meta.url), "utf8");

test("iOS 27 launch configuration adopts a single UIWindowScene lifecycle", () => {
  assert.match(infoPlist, /<key>UIApplicationSceneManifest<\/key>/);
  assert.match(infoPlist, /<key>UIApplicationSupportsMultipleScenes<\/key>\s*<false\/>/);
  assert.match(infoPlist, /<key>UIWindowSceneSessionRoleApplication<\/key>/);
  assert.match(infoPlist, /<key>UISceneConfigurationName<\/key>\s*<string>Default Configuration<\/string>/);
  assert.match(infoPlist, /<key>UISceneDelegateClassName<\/key>\s*<string>\$\(PRODUCT_MODULE_NAME\)\.SceneDelegate<\/string>/);
  assert.match(infoPlist, /<key>UISceneStoryboardFile<\/key>\s*<string>Main<\/string>/);
});

test("AppDelegate returns the matching scene configuration", () => {
  assert.match(appDelegate, /configurationForConnecting connectingSceneSession: UISceneSession/);
  assert.match(appDelegate, /UISceneConfiguration\(name: "Default Configuration", sessionRole: connectingSceneSession\.role\)/);
  assert.match(appDelegate, /configuration\.delegateClass = SceneDelegate\.self/);
  assert.doesNotMatch(appDelegate, /var window: UIWindow\?/);
});

test("SceneDelegate preserves the storyboard bridge and Capacitor URL forwarding", () => {
  assert.match(sceneDelegate, /class SceneDelegate: UIResponder, UIWindowSceneDelegate/);
  assert.match(sceneDelegate, /var window: UIWindow\?/);
  assert.match(sceneDelegate, /guard scene is UIWindowScene else \{ return \}/);
  assert.match(sceneDelegate, /ApplicationDelegateProxy\.shared\.application/);
  assert.match(storyboard, /customClass="CueScoreBridgeViewController"/);
});

test("SceneDelegate is compiled without changing release identity or device family", () => {
  assert.match(project, /SceneDelegate\.swift in Sources/);
  assert.match(project, /CURRENT_PROJECT_VERSION = 79;/);
  assert.match(project, /MARKETING_VERSION = 1\.1;/);
  assert.match(project, /IPHONEOS_DEPLOYMENT_TARGET = 15\.0;/);
  assert.match(project, /TARGETED_DEVICE_FAMILY = 1;/);
});
