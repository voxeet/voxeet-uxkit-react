import LocalizedStrings from "react-localization";
import PropTypes from "prop-types";
import React, { Fragment, Component } from "react";
import VoxeetSdk from "@voxeet/voxeet-web-sdk";

/** Returns true if object isn't null or undefined */
function isDefined(val) {
  return val !== undefined && val != null;
}

/** Returns true if object is type of string or String */
function isString(val) {
  return typeof val === "string" || val instanceof String;
}

/** Converts string to number or returns 'null' if the conversion is not possible.
 *   Examples:
 *  '1234' -> 1234
 *  '5.67' -> 5.67
 *  'foo'  -> null
 */
function stringToNumber(val) {
  const res = +val;
  return res !== NaN ? res : null;
}

/** Converts string to boolean or returns 'null' if the conversion is not possible.
 *  Examples:
 *  'true'  -> true
 *  'TrUe'  -> true
 *  'false' -> false
 *  'faLSE' -> false
 *  '0'     -> null
 *  '1'     -> null
 *  'foo'   -> null
 */
function stringToBool(val) {
  val = val.toLowerCase();
  if (val === true.toString()) {
    return true;
  }
  if (val === false.toString()) {
    return false;
  }
  return null;
}

/**
 * Starts process of fetching a resource from the network.
 * Returns a Promise whose fulfillment handler receives a Blob
 * object when the requested resource has successfully been fetched.
 */
async function fetchBlob(url, options = undefined) {
  const response = await fetch(url, options);
  if (response.ok) {
    return response.blob();
  } else {
    throw new Error(`Failed to fetch '${url}'. Status: ${response.statusText}`);
  }
}

/**
 * Read data from a Blob object as data URL.
 * Returns a Promise whose fulfillment handler receives a dataURL string
 * object when the requested blob has successfully been read.
 */
function readBlobAsDataURL(blob) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      resolve(fileReader.result);
    };
    fileReader.onerror = reject;
    fileReader.readAsDataURL(blob);
  });
}

/**
 * Creates a new <image> element.
 */
async function newHTMLImageElement(dataURL) {
  const img = new Image();
  img.src = dataURL;
  await img.decode();
  return img;
}

/**
 * Creates a new <video> element.
 */
function newHTMLVideoElement(dataURL) {
  const vid = document.createElement("video");
  vid.loop = true;
  vid.muted = true;
  vid.src = dataURL;
  vid.play();
  return vid;
}

/**
 * Returns file media type. Useful to determine whether file is image or video and to get its format.
 */
function getMime(dataURL) {
  const mime = dataURL.substring(
    dataURL.indexOf(":") + 1,
    dataURL.indexOf(";")
  );
  // Split mime to type and subtype,
  // example: 'image/png' -> { type:'image', subtype:'png' }.
  const index = mime.indexOf("/");
  return {
    mime,
    type: mime.substring(0, index),
    subtype: mime.substring(index + 1),
  };
}

/**
 * IDs of virtual background options that can be selected by user in drop-down list
 */
export const VirtualBackgroundId = {
  Off: "option:off",
  Bokeh: "option:bokeh",
  Custom: "option:custom",
  // Prefix for all default images
  DefaultImagePrefix: "default_image:",
  // Prefix for all default videos
  DefaultVideoPrefix: "default_video:",
  // Prefix for all custom files selected by user
  CustomFilePrefix: "custom_file:",
};

/**
 * Helper class that manages default images available for virtual background.
 */
class VirtualBackgroundDefaultImages {
  // key -> imageId, value -> imageMetadata
  #map = new Map();

  constructor(listOfVirtualBackgroundImages = []) {
    let index = 0;
    // Initialize a list of all default images
    listOfVirtualBackgroundImages.forEach((entry) => {
      const imageId = `${VirtualBackgroundId.DefaultImagePrefix}${index++}`;
      const imageMetadata = {
        id: imageId,
        file: entry.file,
        path: `${VoxeetSdk.packageUrlPrefix}videobackgrounds/${entry.file}`,
        title: `Image: ${entry.title}`,
      };
      this.#map.set(imageId, imageMetadata);
    });
  }

  forEach(callbackFn) {
    this.#map.forEach(callbackFn);
  }

  getMetadata(imageId) {
    return this.#map.get(imageId);
  }

  async createHTMLImageElement(imageId) {
    const imageMetadata = this.getMetadata(imageId);
    if (!imageMetadata) {
      throw new Error(
        `Failed to create HTMLImageElement for default image. No associated file with image id '${imageId}'.`
      );
    }
    return await fetchBlob(imageMetadata.path)
      .then(readBlobAsDataURL)
      .then(newHTMLImageElement);
  }

  createSelectList() {
    const list = [];
    this.#map.forEach((imageMetadata, imageId) => {
      list.push(
        <option key={imageId} value={imageId}>
          {imageMetadata.title}
        </option>
      );
    });
    return list;
  }

  hasId(imageId) {
    return this.#map.has(imageId);
  }
}

/**
 * Helper class that manages default videos available for virtual background.
 */
class VirtualBackgroundDefaultVideos {
  // key -> videoId, value -> videoMetadata
  #map = new Map();

  constructor(listOfVirtualBackgroundVideos = []) {
    let index = 0;
    listOfVirtualBackgroundVideos.forEach((entry) => {
      const videoId = `${VirtualBackgroundId.DefaultVideoPrefix}${index++}`;
      const videoMetadata = {
        id: videoId,
        file: entry.file,
        path: `${VoxeetSdk.packageUrlPrefix}videobackgrounds/${entry.file}`,
        title: `Video: ${entry.title}`,
      };
      this.#map.set(videoId, videoMetadata);
    });
  }

  forEach(callbackFn) {
    this.#map.forEach(callbackFn);
  }

  getMetadata(videoId) {
    return this.#map.get(videoId);
  }

  async createHTMLVideoElement(videoId) {
    const videoMetadata = this.getMetadata(videoId);
    if (!videoMetadata) {
      throw new Error(
        `Failed to create HTMLVideoElement for default video. No associated file with video id '${videoId}'.`
      );
    }
    return await fetchBlob(videoMetadata.path)
      .then(readBlobAsDataURL)
      .then(newHTMLVideoElement);
  }

  createSelectList() {
    const list = [];
    this.#map.forEach((videoMetadata, videoId) => {
      list.push(
        <option key={videoId} value={videoId}>
          {videoMetadata.title}
        </option>
      );
    });
    return list;
  }

  hasId(videoId) {
    return this.#map.has(videoId);
  }
}

/**
 * Helper class that manages custom media files for virtual background.
 */
class VirtualBackgroundCustomMediaFiles {
  // key -> customFileId, value -> customFileMetadata
  #map = new Map();

  get supportedMimes() {
    if (!this.supportedMimes_) {
      this.supportedMimes_ = [
        "image/png",
        "image/jpeg",
        "image/bmp",
        "video/mp4",
      ];
    }
    return this.supportedMimes_;
  }

  set supportedMimes(val) {
    this.supportedMimes_ = val;
  }

  async addFile(file) {
    const customFileId = `${VirtualBackgroundId.CustomFilePrefix}${file.name}`;
    const customFileDataURL = await readBlobAsDataURL(file);
    const customFileMetadata = {
      name: file.name,
      dataURL: customFileDataURL,
      mime: getMime(customFileDataURL),
    };
    if (!this.supportedMimes.includes(customFileMetadata.mime.mime)) {
      throw new Error(
        `Failed to read from a custom file '${customFile.name}'. MIME type '${customFileMetadata.mime.mime}' is not supported.`
      );
    }
    this.#map.set(customFileId, customFileMetadata);
    return { customFileId, customFileMetadata };
  }

  addDataURL(fileName, dataURL) {
    const customFileId = `${VirtualBackgroundId.CustomFilePrefix}${fileName}`;
    const customFileMetadata = {
      name: fileName,
      dataURL: dataURL,
      mime: getMime(dataURL),
    };
    if (!this.supportedMimes.includes(customFileMetadata.mime.mime)) {
      throw new Error(
        `Failed to read from a custom file '${customFile.name}'. MIME type '${customFileMetadata.mime.mime}' is not supported.`
      );
    }
    this.#map.set(customFileId, customFileMetadata);
    return { customFileId, customFileMetadata };
  }

  forEach(callbackFn) {
    this.#map.forEach(callbackFn);
  }

  getMetadata(customFileId) {
    return this.#map.get(customFileId);
  }

  async createHTMLMediaElement(customFileId) {
    const customFileMetadata = this.getMetadata(customFileId);
    if (!customFileMetadata) {
      throw new Error(
        `Failed to create HTMLMediaElement for a custom media file. No associated file with id '${customFileId}'.`
      );
    }

    if (customFileMetadata.mime.type === "image") {
      return newHTMLImageElement(customFileMetadata.dataURL);
    } else if (customFileMetadata.mime.type === "video") {
      return newHTMLVideoElement(customFileMetadata.dataURL);
    } else {
      throw new Error(
        `Failed to create HTMLMediaElement for a custom file '${customFileMetadata.name}'. Unexpected MIME type '${customFileMetadata.mime.mime}'.`
      );
    }
  }

  createSelectList() {
    const list = [];

    this.#map.forEach((customFileMetadata, customFileId) => {
      list.push(
        <option key={customFileId} value={customFileId}>
          {customFileMetadata.name}
        </option>
      );
    });

    return list;
  }

  hasId(customFileId) {
    return this.#map.has(customFileId);
  }

  /**
   * Returns true if 'potentialCustomFielId' starts with a prefix
   * which matches to a customFileId scheme.
   */
  maybeIdMatches(potentialCustomFileId) {
    return isString(potentialCustomFileId)
      ? potentialCustomFileId.startsWith(VirtualBackgroundId.CustomFilePrefix)
      : false;
  }

  /** Returns the number of custom file in this collection. */
  size() {
    return this.#map.size;
  }
}

/**
 * Helper class that wraps VoxeetSDK.video.local.setProcessor API.
 * The class executes all asynchronous calls in sequential way to
 * prevent VoxeetSDK from overload and unexpected behavior.
 */
export class VideoProcessorProxy {
  #executor = Promise.resolve();

  /**
   * Enqueues a function call to ensure a sequential execution of all submitted async operations
   */
  #execute(fn, ...args) {
    return new Promise((resolve, reject) => {
      this.#executor = this.#executor
        .then(() => fn(...args))
        .then((result) => resolve(result))
        .catch((error) => reject(error));
    });
  }

  set(videoProcessorOptions) {
    return this.#execute(
      VoxeetSdk.video.local.setProcessor.bind(VoxeetSdk.video.local),
      videoProcessorOptions
    );
  }

  disable() {
    return this.#execute(
      VoxeetSdk.video.local.disableProcessing.bind(VoxeetSdk.video.local)
    );
  }
}

/**
 * Default state of video processor options and virtual background id
 */
export const VideoProcessorDefaultState = {
  VirtualBackgroundId: VirtualBackgroundId.Off,
  FacialSmoothingStrength: 0,
  SpotLightStrength: 0,
  AutoBrightness: false,
  NoiseReduction: false,
  AutoFraming: false,
  FlagNonBlockingAsyncPixelReadback: true,
};

const CacheEntry = {
  VirtualBackgroundId: "videoProcessor_VirtualBackgroundId",
  VirtualBackgroundCustomFileMetadata:
    "videoProcessor_VirtualBackgroundCustomFileMetadata",
  FacialSmoothingStrength: "videoProcessor_FacialSmoothingStrength",
  SpotLightStrength: "videoProcessor_SpotLightStrength",
  AutoBrightness: "videoProcessor_AutoBrightness",
  NoiseReduction: "videoProcessor_NoiseReduction",
  AutoFraming: "videoProcessor_AutoFraming",
  FlagNonBlockingAsyncPixelReadback:
    "videoProcessor_flag_NonBlockingAsyncPixelReadback",
};

/**
 * Helper class to build VideoProcessorOptions structure
 */
export class VideoProcessorOptionsBuilder {
  #videoProcessorOptions = {};

  build() {
    return { ...this.#videoProcessorOptions };
  }

  setVirtualBackground(background) {
    if (isDefined(background)) {
      this.#videoProcessorOptions.virtualBackground = background;
    } else {
      delete this.#videoProcessorOptions.virtualBackground;
    }
    return this;
  }

  setFacialSmoothing(strength) {
    if (isDefined(strength)) {
      this.#videoProcessorOptions.facialSmoothing = strength;
    } else {
      delete this.#videoProcessorOptions.facialSmoothing;
    }
    return this;
  }

  setSpotLight(strength) {
    if (isDefined(strength)) {
      this.#videoProcessorOptions.spotLight = strength;
    } else {
      delete this.#videoProcessorOptions.spotLight;
    }
    return this;
  }

  setAutoFraming(enabled) {
    if (isDefined(enabled)) {
      this.#videoProcessorOptions.autoFraming = enabled;
    } else {
      delete this.#videoProcessorOptions.autoFraming;
    }
    return this;
  }

  setNoiseReduction(enabled) {
    if (isDefined(enabled)) {
      this.#videoProcessorOptions.noiseReduction = enabled;
    } else {
      delete this.#videoProcessorOptions.noiseReduction;
    }
    return this;
  }

  setAutoBrightness(enabled) {
    if (isDefined(enabled)) {
      this.#videoProcessorOptions.autoBrightness = enabled;
    } else {
      delete this.#videoProcessorOptions.autoBrightness;
    }
    return this;
  }

  setFlagNonBlockingAsyncPixelReadback(enabled) {
    this.#initFlags();
    if (isDefined(enabled)) {
      this.#videoProcessorOptions.flags.nonBlockingAsyncPixelReadback = enabled;
    } else {
      delete this.#videoProcessorOptions.flags.nonBlockingAsyncPixelReadback;
    }
    return this;
  }

  #initFlags() {
    if (!isDefined(this.#videoProcessorOptions.flags)) {
      this.#videoProcessorOptions.flags = {};
    }
  }
}

/**
 * Helper class to manage a cache.
 *
 * ToDo: Consider to use a Reducers and Actions instead of localStorage.
 */
export class VideoProcessorCache {
  /**
   * Read value from a local storage and parse it to number. If the conversion to number
   * isn't possible or item doesn't exist then a default value is returned.
   */
  #getValueAsNumber(key, defaultValue = undefined) {
    const cache = localStorage.getItem(key);
    let val;
    if (isString(cache)) {
      const val = stringToNumber(cache);
      return isDefined(val) ? val : defaultValue;
    }
    return defaultValue;
  }

  /**
   * Read value from a local storage and parse it to boolean. If the conversion to boolean
   * isn't possible or item doesn't exist then a default value is returned.
   */
  #getValueAsBool(key, defaultValue = undefined) {
    const cache = localStorage.getItem(key);
    let val;
    if (isString(cache)) {
      const val = stringToBool(cache);
      return isDefined(val) ? val : defaultValue;
    }
    return defaultValue;
  }

  /**
   * Read value from a local storage as a string. If value doesn't exist, then
   * a default value is returned.
   */
  #getValueAsString(key, defaultValue = undefined) {
    const cache = localStorage.getItem(key);
    return isString(cache) ? cache : defaultValue;
  }

  #setValue(key, value) {
    localStorage.setItem(key, value);
  }

  removeAll() {
    for (const [_, entryName] of Object.entries(CacheEntry)) {
      //ToDo: Add some UI control that would allow user to toggle Video Processor Flags
      if (entryName === CacheEntry.FlagNonBlockingAsyncPixelReadback) continue;

      localStorage.removeItem(entryName);
    }
  }

  set virtualBackgroundId(id) {
    this.#setValue(CacheEntry.VirtualBackgroundId, id);
  }
  get virtualBackgroundId() {
    return this.#getValueAsString(
      CacheEntry.VirtualBackgroundId,
      VideoProcessorDefaultState.VirtualBackgroundId
    );
  }

  set virtualBackgroundCustomFileMetadata(customFileMetadata) {
    const json = JSON.stringify(customFileMetadata);
    this.#setValue(CacheEntry.VirtualBackgroundCustomFileMetadata, json);
  }
  get virtualBackgroundCustomFileMetadata() {
    const json = this.#getValueAsString(
      CacheEntry.VirtualBackgroundCustomFileMetadata
    );
    return isDefined(json) ? JSON.parse(json) : undefined;
  }

  set facialSmoothingStrength(strength) {
    this.#setValue(CacheEntry.FacialSmoothingStrength, strength);
  }
  get facialSmoothingStrength() {
    return this.#getValueAsNumber(
      CacheEntry.FacialSmoothingStrength,
      VideoProcessorDefaultState.FacialSmoothingStrength
    );
  }

  set spotLightStrength(strength) {
    this.#setValue(CacheEntry.SpotLightStrength, strength);
  }
  get spotLightStrength() {
    return this.#getValueAsNumber(
      CacheEntry.SpotLightStrength,
      VideoProcessorDefaultState.SpotLightStrength
    );
  }

  set autoBrightness(enabled) {
    this.#setValue(CacheEntry.AutoBrightness, enabled);
  }
  get autoBrightness() {
    return this.#getValueAsBool(
      CacheEntry.AutoBrightness,
      VideoProcessorDefaultState.AutoBrightness
    );
  }

  set noiseReduction(enabled) {
    this.#setValue(CacheEntry.NoiseReduction, enabled);
  }
  get noiseReduction() {
    return this.#getValueAsBool(
      CacheEntry.NoiseReduction,
      VideoProcessorDefaultState.NoiseReduction
    );
  }

  set autoFraming(enabled) {
    this.#setValue(CacheEntry.AutoFraming, enabled);
  }
  get autoFraming() {
    return this.#getValueAsBool(
      CacheEntry.AutoFraming,
      VideoProcessorDefaultState.AutoFraming
    );
  }

  set flagNonBlockingAsyncPixelReadback(enabled) {
    this.#setValue(CacheEntry.FlagNonBlockingAsyncPixelReadback, enabled);
  }
  get flagNonBlockingAsyncPixelReadback() {
    return this.#getValueAsBool(
      CacheEntry.FlagNonBlockingAsyncPixelReadback,
      VideoProcessorDefaultState.FlagNonBlockingAsyncPixelReadback
    );
  }
}

/**
 * Global container for default image and video list that can be set as a virtual background.
 *
 * Usage:
 *
 * DefaultVirtualBackgrounds.getImageList([
 *   {
 *     title: "Image title visible in drop down list",
 *     file: "my_image.jpg",
 *   },
 *   {
 *     title: "San Francisco City Hall",
 *     file: "assets/default_background_image.png",
 *   }
 * ]);
 *
 * Where:
 *  title - name of <option> list that is generated by VirtualBackgroundFacade.generateSelectList()
 *  file - relative path to file. Is is an argument to fetch() method.
 */
export class DefaultVirtualBackgrounds {
  static #imageList;
  static #videoList;

  static setImageList(list) {
    DefaultVirtualBackgrounds.#imageList = list;
  }

  static getImageList() {
    return DefaultVirtualBackgrounds.#imageList ?? [];
  }

  static setVideoList(list) {
    DefaultVirtualBackgrounds.#videoList = list;
  }

  static getVideoList(list) {
    return DefaultVirtualBackgrounds.#videoList ?? [];
  }
}

export class VirtualBackgroundFacade {
  #defaultImages;
  #defaultVideos;
  #customMediaFiles;
  #cache;

  constructor() {
    this.#defaultImages = new VirtualBackgroundDefaultImages(
      DefaultVirtualBackgrounds.getImageList()
    );
    this.#defaultVideos = new VirtualBackgroundDefaultVideos(
      DefaultVirtualBackgrounds.getVideoList()
    );
    this.#customMediaFiles = new VirtualBackgroundCustomMediaFiles();
    this.#cache = new VideoProcessorCache();
  }

  /**
   * Reads Virtual Background configuration from a cache.
   *
   * Returns a virtual background id.
   */
  initFromCache() {
    let virtualBackgroundId = this.#cache.virtualBackgroundId;

    // Validate virtualBackgroundId and read customFileMetadata if needed
    if (this.#customMediaFiles.maybeIdMatches(virtualBackgroundId)) {
      // Try to read a metadata of custom file from a cache
      const customFileMetadata =
        this.#cache.virtualBackgroundCustomFileMetadata;
      if (isDefined(customFileMetadata)) {
        this.#customMediaFiles.addDataURL(
          customFileMetadata.name,
          customFileMetadata.dataURL
        );
      } else {
        // Custom file metadata is missing, fall back to default option
        virtualBackgroundId = VideoProcessorDefaultState.VirtualBackgroundId;
      }
    } else if (
      virtualBackgroundId !== VirtualBackgroundId.Off &&
      virtualBackgroundId !== VirtualBackgroundId.Bokeh &&
      !this.#defaultImages.hasId(virtualBackgroundId) &&
      !this.#defaultVideos.hasId(virtualBackgroundId)
    ) {
      // Ignore any other values and fall back to default
      virtualBackgroundId = VideoProcessorDefaultState.VirtualBackgroundId;
    }

    return virtualBackgroundId;
  }

  /**
   * Writes virtual background id to a cache.
   */
  writeToCache(virtualBackgroundId) {
    if (this.#customMediaFiles.hasId(virtualBackgroundId)) {
      // Cache a metadata of the current selected custom file
      const customFileMetadata =
        this.#customMediaFiles.getMetadata(virtualBackgroundId);
      try {
        // Don't cache the virtual background ID if the metadata write failed.
        // Writing metadata may fail if its size exceeds a cache limitation.
        this.#cache.virtualBackgroundCustomFileMetadata = customFileMetadata;
        this.#cache.virtualBackgroundId = virtualBackgroundId;
      } catch (error) {
        console.warn(
          `Failed to store the file '${customFileMetadata.name}' in local storage. Error:`,
          error
        );
      }
    } else {
      this.#cache.virtualBackgroundId = virtualBackgroundId;
      // Remove customFileMetadata to free up cache space
      this.#cache.virtualBackgroundCustomFileMetadata = null;
    }
  }

  /**
   * Adds a new custom file to file list.
   *
   * Returns a new virtual background id associated with the file.
   */
  async addCustomMediaFile(file) {
    const { customFileId, customFileMetadata } =
      await this.#customMediaFiles.addFile(file);
    return customFileId;
  }

  /**
   * Returns array of supported mime.
   */
  supportedCustomMediaFormats() {
    return this.#customMediaFiles.supportedMimes;
  }

  /**
   * Converts a virtual background ID to a WebSDK-acceptable parameter
   *
   * Returns: false | "bokeh" | HTMLImageElement | HTMLVideoElement
   */
  async prepareVirtualBackground(virtualBackgroundId) {
    if (virtualBackgroundId === VirtualBackgroundId.Off) {
      return false;
    } else if (virtualBackgroundId === VirtualBackgroundId.Bokeh) {
      return "bokeh";
    } else if (this.#defaultImages.hasId(virtualBackgroundId)) {
      return this.#defaultImages.createHTMLImageElement(virtualBackgroundId);
    } else if (this.#defaultVideos.hasId(virtualBackgroundId)) {
      return this.#defaultVideos.createHTMLVideoElement(virtualBackgroundId);
    } else if (this.#customMediaFiles.hasId(virtualBackgroundId)) {
      return this.#customMediaFiles.createHTMLMediaElement(virtualBackgroundId);
    } else {
      throw new Error(
        `Unexpected virtual background id '${virtualBackgroundId}'.`
      );
    }
  }

  /**
   * Generates a new array of <option> tha can be used inside <select> tag
   */
  generateSelectList() {
    return [
      <option key={VirtualBackgroundId.Off} value={VirtualBackgroundId.Off}>
        Off
      </option>,
      <option key={VirtualBackgroundId.Bokeh} value={VirtualBackgroundId.Bokeh}>
        Bokeh
      </option>,
      ...this.#defaultImages.createSelectList(),
      ...this.#defaultVideos.createSelectList(),
      ...this.#customMediaFiles.createSelectList(),
    ];
  }
}

/**
 * Returns VideoProcessorOptions structure that can be an argument to VoxeetSDK.video.local.setProcessor().
 * VideoProcessorOptions contains the last values from cache.
 */
export async function getVideoProcessorOptionsFromCache() {
  const videoProcessorCache = new VideoProcessorCache();
  const virtualBackgroundFacade = new VirtualBackgroundFacade();
  let virtualBackground;
  try {
    const virtualBackgroundId = virtualBackgroundFacade.initFromCache();
    virtualBackground = await virtualBackgroundFacade.prepareVirtualBackground(
      virtualBackgroundId
    );
  } catch (error) {
    // Virtual background preparation may fail but it is acceptable, just ignore the error
    console.warn(error);
  }
  return new VideoProcessorOptionsBuilder()
    .setVirtualBackground(virtualBackground)
    .setFacialSmoothing(videoProcessorCache.facialSmoothingStrength)
    .setSpotLight(videoProcessorCache.spotLightStrength)
    .setAutoFraming(videoProcessorCache.autoFraming)
    .setNoiseReduction(videoProcessorCache.noiseReduction)
    .setAutoBrightness(videoProcessorCache.autoBrightness)
    .setFlagNonBlockingAsyncPixelReadback(
      videoProcessorCache.flagNonBlockingAsyncPixelReadback
    )
    .build();
}
