//As long as the cache is hit sometime before the max age, the cached value is considered valid.
//If between min and max age, the cached value will be returned while the cached value gets recomputed on the server (asynchronous cache refill).
//A time to live (ttl) is stored along with the value. It will be reset when the cached value is recomputed.
export const maxAgeMs = 1000 * 60 * 60 * 24 * 14; //If the cached value is beyond this age, the cached value is always considered invalid and it will get recomputed
export const minAgeMs = 1000 * 60 * 60 * 24 * 7; //If the cached value is below this age, it will not even be checked to see if it needs to be recomputed

//A grace period begins as soon as the value starts being recomputed
//The grace period duration should be the maximum amount of time it takes to recompute the cached value
//While in the grace period, the cached value will be returned and asynchronous cache refills will be prevented
export const graceMs = 1000 * 60 * 5;
