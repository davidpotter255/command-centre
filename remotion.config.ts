import { Config } from '@remotion/cli/config'

Config.setVideoImageFormat('jpeg')
Config.setOverwriteOutput(true)

// Social platforms re-encode anyway, but a high CRF floor keeps gradients
// and the dark backgrounds free of banding after their second pass.
Config.setCrf(16)
Config.setPixelFormat('yuv420p')
Config.setCodec('h264')

// Entry point for `npx remotion studio` / `npx remotion render`.
Config.setEntryPoint('./src/remotion/index.ts')
