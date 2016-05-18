There are two main ways to use the Hls.js wrapper. Using it as a fully bundled Hls.js shim, or injecting the dependency (or even the instance) by yourself.

First and preferred way is with the bundle including the Hls.js library
(i.e a specific version for which we provide support in this combination), which is the simplest
one, and giving you an constructor just as if you imported the vanilla Hls.js - only minimal to no changes needed in your app. You only need to add the Streamroot config to the constructor. See the "bundle" example.

The other way is dependency-injecting yourself the Hls.js constructor to rule over what version or fork
of the player you will use. Both ways are exposed below. We do not officially recommend to
do the low-level DI yourself because we do not support just any version of Hls.js in combination
with our peer-agent technology i.e this wrapper. See the "custom" example.

We also still support the legacy way of injecting an Hls.js player instance created by your app. See the "legacy" example. WARNING: This example documents a deprecated API. We will not support this mode any further soon.

