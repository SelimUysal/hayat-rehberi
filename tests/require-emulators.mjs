if (!process.env.FIRESTORE_EMULATOR_HOST || !process.env.FIREBASE_AUTH_EMULATOR_HOST) {
  throw new Error('Cloud tests require local Auth and Firestore emulators. Run through firebase emulators:exec --only firestore,auth --project demo-hayat-rehberi. Production must never be used for these tests.');
}
if (![process.env.FIRESTORE_EMULATOR_HOST,process.env.FIREBASE_AUTH_EMULATOR_HOST].every(host=>/^(localhost|127\.0\.0\.1):\d+$/.test(host))) {
  throw new Error('Cloud tests require localhost emulator addresses.');
}
