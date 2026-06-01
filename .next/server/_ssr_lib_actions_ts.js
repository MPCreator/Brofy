"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "_ssr_lib_actions_ts";
exports.ids = ["_ssr_lib_actions_ts"];
exports.modules = {

/***/ "(ssr)/./lib/actions.ts":
/*!************************!*\
  !*** ./lib/actions.ts ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   acceptPriceChange: () => (/* binding */ acceptPriceChange),
/* harmony export */   acceptReschedule: () => (/* binding */ acceptReschedule),
/* harmony export */   addPet: () => (/* binding */ addPet),
/* harmony export */   addService: () => (/* binding */ addService),
/* harmony export */   addTransaction: () => (/* binding */ addTransaction),
/* harmony export */   bookWithCredits: () => (/* binding */ bookWithCredits),
/* harmony export */   cancelAppointmentWithRefund: () => (/* binding */ cancelAppointmentWithRefund),
/* harmony export */   completeReminder: () => (/* binding */ completeReminder),
/* harmony export */   createAdminAuditReminder: () => (/* binding */ createAdminAuditReminder),
/* harmony export */   createAppointment: () => (/* binding */ createAppointment),
/* harmony export */   createClaim: () => (/* binding */ createClaim),
/* harmony export */   createEstablishment: () => (/* binding */ createEstablishment),
/* harmony export */   createGlobalReminder: () => (/* binding */ createGlobalReminder),
/* harmony export */   createGuestFastEntry: () => (/* binding */ createGuestFastEntry),
/* harmony export */   createMedicalRecord: () => (/* binding */ createMedicalRecord),
/* harmony export */   createReminder: () => (/* binding */ createReminder),
/* harmony export */   createReview: () => (/* binding */ createReview),
/* harmony export */   deleteAccount: () => (/* binding */ deleteAccount),
/* harmony export */   deletePet: () => (/* binding */ deletePet),
/* harmony export */   deleteReminder: () => (/* binding */ deleteReminder),
/* harmony export */   deleteService: () => (/* binding */ deleteService),
/* harmony export */   deleteTransaction: () => (/* binding */ deleteTransaction),
/* harmony export */   fileDenuncia: () => (/* binding */ fileDenuncia),
/* harmony export */   getAllClaims: () => (/* binding */ getAllClaims),
/* harmony export */   getAllDisputedAppointments: () => (/* binding */ getAllDisputedAppointments),
/* harmony export */   getAllRemindersAdmin: () => (/* binding */ getAllRemindersAdmin),
/* harmony export */   getAllUsers: () => (/* binding */ getAllUsers),
/* harmony export */   getAppointmentForVet: () => (/* binding */ getAppointmentForVet),
/* harmony export */   getClientAppointments: () => (/* binding */ getClientAppointments),
/* harmony export */   getClientReminders: () => (/* binding */ getClientReminders),
/* harmony export */   getEstablishmentById: () => (/* binding */ getEstablishmentById),
/* harmony export */   getEstablishmentByQr: () => (/* binding */ getEstablishmentByQr),
/* harmony export */   getEstablishmentPublic: () => (/* binding */ getEstablishmentPublic),
/* harmony export */   getEstablishmentReviews: () => (/* binding */ getEstablishmentReviews),
/* harmony export */   getEstablishmentServices: () => (/* binding */ getEstablishmentServices),
/* harmony export */   getEstablishments: () => (/* binding */ getEstablishments),
/* harmony export */   getFinanceSummary: () => (/* binding */ getFinanceSummary),
/* harmony export */   getMedicalHistory: () => (/* binding */ getMedicalHistory),
/* harmony export */   getMedicalRecordByAppointment: () => (/* binding */ getMedicalRecordByAppointment),
/* harmony export */   getMyEstablishments: () => (/* binding */ getMyEstablishments),
/* harmony export */   getMyRole: () => (/* binding */ getMyRole),
/* harmony export */   getNearbyEstablishments: () => (/* binding */ getNearbyEstablishments),
/* harmony export */   getOpenFichas: () => (/* binding */ getOpenFichas),
/* harmony export */   getPendingAppointments: () => (/* binding */ getPendingAppointments),
/* harmony export */   getPetById: () => (/* binding */ getPetById),
/* harmony export */   getPetHistoryForProvider: () => (/* binding */ getPetHistoryForProvider),
/* harmony export */   getProfile: () => (/* binding */ getProfile),
/* harmony export */   getTransactions: () => (/* binding */ getTransactions),
/* harmony export */   getUserPets: () => (/* binding */ getUserPets),
/* harmony export */   getVetAppointments: () => (/* binding */ getVetAppointments),
/* harmony export */   getVetDebt: () => (/* binding */ getVetDebt),
/* harmony export */   getVetReminders: () => (/* binding */ getVetReminders),
/* harmony export */   getVetStats: () => (/* binding */ getVetStats),
/* harmony export */   payVetDebt: () => (/* binding */ payVetDebt),
/* harmony export */   processPayment: () => (/* binding */ processPayment),
/* harmony export */   proposeReschedule: () => (/* binding */ proposeReschedule),
/* harmony export */   resolveDenunciaAdmin: () => (/* binding */ resolveDenunciaAdmin),
/* harmony export */   toggleAccountStatus: () => (/* binding */ toggleAccountStatus),
/* harmony export */   updateAppointmentStatus: () => (/* binding */ updateAppointmentStatus),
/* harmony export */   updateClaimStatus: () => (/* binding */ updateClaimStatus),
/* harmony export */   updateEstablishment: () => (/* binding */ updateEstablishment),
/* harmony export */   updatePet: () => (/* binding */ updatePet),
/* harmony export */   updateProfile: () => (/* binding */ updateProfile),
/* harmony export */   updateRevisionMessage: () => (/* binding */ updateRevisionMessage),
/* harmony export */   updateService: () => (/* binding */ updateService),
/* harmony export */   validateOtp: () => (/* binding */ validateOtp),
/* harmony export */   validateVetCmvp: () => (/* binding */ validateVetCmvp)
/* harmony export */ });
/* harmony import */ var next_dist_client_app_call_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/client/app-call-server */ "(ssr)/./node_modules/next/dist/client/app-call-server.js");
/* harmony import */ var next_dist_client_app_call_server__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_client_app_call_server__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! private-next-rsc-action-client-wrapper */ "(ssr)/./node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js");



function __build_action__(action, args) {
  return (0,next_dist_client_app_call_server__WEBPACK_IMPORTED_MODULE_0__.callServer)(action.$$id, args)
}

/* __next_internal_action_entry_do_not_use__ {"034b27a1fda34427cefe1fd8469c8783b08a7df1":"createReminder","09a2a54407c9d7e0ac8e50d607620a507f30b7c3":"createClaim","0f3d2ba9767938637a2340022d5d5b789ef536f5":"bookWithCredits","1190ecc6c0bfb1d1749f43401054f9ff540cc389":"getFinanceSummary","127deb99ee6285e125e09897b1a2af9a3d2cfa35":"getVetStats","1d5754ec458867269b04a3700359d48bab8c704a":"getEstablishmentPublic","20c8af5efcfd3e9686982956500d3441e9ea6077":"getClientAppointments","2357910e6102bf1e3313d162ddba9857b2e0b0ac":"getClientReminders","268bcf569d72a53c263a991d737e3e8796f72ba9":"deleteTransaction","285772fb1549fb3caf8c57b4477e29bba4ebe8de":"getVetDebt","2963701d8c09d6fa9f8196ff20611a4345294179":"getAllDisputedAppointments","2d12d76b67717dce6b58b4eb34e88bcc3847a83b":"createEstablishment","2d92e3064c5e56394b4078d350f835cd2ba02236":"deleteReminder","309e3b82497d7c0ebd709ccfcd6da0ed8c96700f":"getPendingAppointments","343962624710f6695a5bd4546f0849c672b22b6d":"getProfile","3ab477e9dbd7fdc1d9754bcd6529b98942fff273":"getMedicalHistory","4202daf3b0bea071d19c70454e177b8a48c3959a":"acceptPriceChange","4a33cfe89ae484ceb3ff2bc9e47d4de3459c6dc2":"updateClaimStatus","4e6164c843ef0079911e0e3dd5ebbee56152309d":"acceptReschedule","531f80fa91686d7d3e36683bf4f5c9ffff8edf3a":"getAllUsers","589a5c3062ed7963e5332cb185c27393a8f781e4":"createReview","5d1e512c0a6437d377c0dc731d204d728af3c02d":"createGuestFastEntry","70a740c40dd3615b579c0ce089c7d1aa47dfe0fc":"getEstablishmentByQr","7500194e062f49800fcb7ed043353ea82da0b052":"getEstablishmentById","7a8e873c9854e8894ed15dd49002b5deb6d6cac5":"getVetReminders","7dc293e9688219b67822b79c57c1ca01645fc691":"createMedicalRecord","7eebf2a805fb1d17f63122be89a0982b8c9cd239":"getNearbyEstablishments","86cf4b5432ceb020ecdea935bbf0e3b333227888":"validateVetCmvp","881c771ab8d414063b5d8e0b1c3d347023fad14c":"getVetAppointments","89f5f0ee9a870a8d0b597860dbf46becaba53886":"getMyEstablishments","8b462b45d3d0129bf8369ff0d47999eb47b8c1d8":"updateService","8f7aea55d784b13a53b1e6502b3aac6bb9044689":"resolveDenunciaAdmin","98f60cd69eeefe309d3369714f93195751cb57a7":"validateOtp","a0e43292692c525f2f72ac58ee6002b3aa0f592e":"addTransaction","a2677b98fabadaa1678be550cb3e2e3d2a3adfd6":"deleteAccount","a2ed9cd40cbf036219f9bf987e4836c9f3f9be4f":"createGlobalReminder","a2f151f1f7dd784d9b3607926420d7b4596c84ff":"proposeReschedule","a67d7a885c2e806c8181875ea5af1c1eb7f9a98b":"toggleAccountStatus","a75f4be5c3d7241aba1b8c98a67ded69249073bc":"getEstablishments","aa1c5f2f9dbc8a0139181440dfc92c4caa94ac6c":"completeReminder","aad5012852fca453dc27b431417bf3fcca49b42b":"addService","ae56aadef33fd72dc6f7971286f1e7ff7402aa67":"getUserPets","b06819d3cbf9bb96b4a56d83569d7cb3fdb94de7":"getAppointmentForVet","b2d9e74b59c9f0d6f8a577089d5987f39f1b2518":"getOpenFichas","b48f92edf04cc13c1bb07bfff2ac6b4914ed86ed":"addPet","b92461d8b813cf393d316a0b1696bc6706592553":"getMedicalRecordByAppointment","bb5de62c84235cc18d013f910cfb4711a1f2dda1":"getTransactions","be0fb6da4c3c949c7be7ccda32275988801fa8cd":"getMyRole","bf28ba8879011b4373fdb23448d081ed92b9bd94":"getAllRemindersAdmin","c0f2549c133fe0eef2bb5f3ea83cfe7166f46a50":"updateEstablishment","c5537468e2f3ba8dd774f47b948aff5fbf19b15f":"cancelAppointmentWithRefund","c87fd2d3885739c042df20b8b0bf8a626385bbbf":"getEstablishmentReviews","cc085105a5710cbed33304bf153e30347da9c8c2":"updateRevisionMessage","cf7dcf824747d09cd0d79845a4fab53bf561c0c3":"processPayment","d3f92ed537509f0d02ca750f73e8a31822270b27":"getPetHistoryForProvider","d43d0f6d47c3d9daf8903f23977def3e044a89b2":"getEstablishmentServices","da8d9aa9daef2e29e4c9785b12968acab9156597":"createAdminAuditReminder","e06c5be8b63c1c52f9ea32de4fd9665d1b05468e":"getAllClaims","e291ff37913707547bcbeaaabfb9fee71fcbdfaf":"payVetDebt","e499e165bde351b192fc8b93a5d829c341485b89":"updateAppointmentStatus","e5f2f4bc03ace1fe3be86418d8c8e9ac11180815":"getPetById","ee6af09fa118f9538131bcebabeb39f54c526429":"deletePet","ef0e7a27f97e9e60b5627bb742db716f7f4900b1":"createAppointment","efb81a667dd90c3e5b9a6759f126c32367f8242a":"deleteService","f93dbcd01c33407bde92b22ccfa38e03bd04744a":"updatePet","fc073fcccd74eef8424442ad35eb6c11ca0c4fcd":"updateProfile","fe32ca520e5df2ce60a684f63c5d033618af4bd0":"fileDenuncia"} */ var cancelAppointmentWithRefund = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("c5537468e2f3ba8dd774f47b948aff5fbf19b15f");

var getMyRole = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("be0fb6da4c3c949c7be7ccda32275988801fa8cd");
var addPet = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("b48f92edf04cc13c1bb07bfff2ac6b4914ed86ed");
var getUserPets = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("ae56aadef33fd72dc6f7971286f1e7ff7402aa67");
var getPetById = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("e5f2f4bc03ace1fe3be86418d8c8e9ac11180815");
var updatePet = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("f93dbcd01c33407bde92b22ccfa38e03bd04744a");
var deletePet = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("ee6af09fa118f9538131bcebabeb39f54c526429");
var getEstablishments = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("a75f4be5c3d7241aba1b8c98a67ded69249073bc");
var getNearbyEstablishments = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("7eebf2a805fb1d17f63122be89a0982b8c9cd239");
var getEstablishmentByQr = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("70a740c40dd3615b579c0ce089c7d1aa47dfe0fc");
var getEstablishmentById = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("7500194e062f49800fcb7ed043353ea82da0b052");
var createEstablishment = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("2d12d76b67717dce6b58b4eb34e88bcc3847a83b");
var createAppointment = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("ef0e7a27f97e9e60b5627bb742db716f7f4900b1");
var processPayment = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("cf7dcf824747d09cd0d79845a4fab53bf561c0c3");
var getPendingAppointments = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("309e3b82497d7c0ebd709ccfcd6da0ed8c96700f");
var validateOtp = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("98f60cd69eeefe309d3369714f93195751cb57a7");
var createMedicalRecord = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("7dc293e9688219b67822b79c57c1ca01645fc691");
var createGuestFastEntry = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("5d1e512c0a6437d377c0dc731d204d728af3c02d");
var getVetDebt = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("285772fb1549fb3caf8c57b4477e29bba4ebe8de");
var payVetDebt = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("e291ff37913707547bcbeaaabfb9fee71fcbdfaf");
var createReview = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("589a5c3062ed7963e5332cb185c27393a8f781e4");
var getEstablishmentReviews = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("c87fd2d3885739c042df20b8b0bf8a626385bbbf");
var getClientAppointments = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("20c8af5efcfd3e9686982956500d3441e9ea6077");
var getVetAppointments = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("881c771ab8d414063b5d8e0b1c3d347023fad14c");
var getOpenFichas = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("b2d9e74b59c9f0d6f8a577089d5987f39f1b2518");
var getMedicalHistory = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("3ab477e9dbd7fdc1d9754bcd6529b98942fff273");
var getMedicalRecordByAppointment = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("b92461d8b813cf393d316a0b1696bc6706592553");
var getPetHistoryForProvider = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("d3f92ed537509f0d02ca750f73e8a31822270b27");
var getAppointmentForVet = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("b06819d3cbf9bb96b4a56d83569d7cb3fdb94de7");
var updateAppointmentStatus = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("e499e165bde351b192fc8b93a5d829c341485b89");
var getVetStats = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("127deb99ee6285e125e09897b1a2af9a3d2cfa35");
var getProfile = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("343962624710f6695a5bd4546f0849c672b22b6d");
var updateProfile = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("fc073fcccd74eef8424442ad35eb6c11ca0c4fcd");
var getEstablishmentServices = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("d43d0f6d47c3d9daf8903f23977def3e044a89b2");
var getMyEstablishments = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("89f5f0ee9a870a8d0b597860dbf46becaba53886");
var addService = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("aad5012852fca453dc27b431417bf3fcca49b42b");
var updateService = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("8b462b45d3d0129bf8369ff0d47999eb47b8c1d8");
var deleteService = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("efb81a667dd90c3e5b9a6759f126c32367f8242a");
var getTransactions = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("bb5de62c84235cc18d013f910cfb4711a1f2dda1");
var addTransaction = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("a0e43292692c525f2f72ac58ee6002b3aa0f592e");
var deleteTransaction = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("268bcf569d72a53c263a991d737e3e8796f72ba9");
var getFinanceSummary = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("1190ecc6c0bfb1d1749f43401054f9ff540cc389");
var getEstablishmentPublic = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("1d5754ec458867269b04a3700359d48bab8c704a");
var updateEstablishment = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("c0f2549c133fe0eef2bb5f3ea83cfe7166f46a50");
var getAllUsers = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("531f80fa91686d7d3e36683bf4f5c9ffff8edf3a");
var validateVetCmvp = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("86cf4b5432ceb020ecdea935bbf0e3b333227888");
var toggleAccountStatus = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("a67d7a885c2e806c8181875ea5af1c1eb7f9a98b");
var updateRevisionMessage = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("cc085105a5710cbed33304bf153e30347da9c8c2");
var deleteAccount = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("a2677b98fabadaa1678be550cb3e2e3d2a3adfd6");
var createClaim = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("09a2a54407c9d7e0ac8e50d607620a507f30b7c3");
var getAllClaims = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("e06c5be8b63c1c52f9ea32de4fd9665d1b05468e");
var updateClaimStatus = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("4a33cfe89ae484ceb3ff2bc9e47d4de3459c6dc2");
var createReminder = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("034b27a1fda34427cefe1fd8469c8783b08a7df1");
var getClientReminders = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("2357910e6102bf1e3313d162ddba9857b2e0b0ac");
var getVetReminders = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("7a8e873c9854e8894ed15dd49002b5deb6d6cac5");
var completeReminder = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("aa1c5f2f9dbc8a0139181440dfc92c4caa94ac6c");
var deleteReminder = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("2d92e3064c5e56394b4078d350f835cd2ba02236");
var createGlobalReminder = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("a2ed9cd40cbf036219f9bf987e4836c9f3f9be4f");
var getAllRemindersAdmin = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("bf28ba8879011b4373fdb23448d081ed92b9bd94");
var createAdminAuditReminder = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("da8d9aa9daef2e29e4c9785b12968acab9156597");
var bookWithCredits = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("0f3d2ba9767938637a2340022d5d5b789ef536f5");
var fileDenuncia = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("fe32ca520e5df2ce60a684f63c5d033618af4bd0");
var proposeReschedule = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("a2f151f1f7dd784d9b3607926420d7b4596c84ff");
var acceptReschedule = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("4e6164c843ef0079911e0e3dd5ebbee56152309d");
var getAllDisputedAppointments = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("2963701d8c09d6fa9f8196ff20611a4345294179");
var resolveDenunciaAdmin = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("8f7aea55d784b13a53b1e6502b3aac6bb9044689");
var acceptPriceChange = (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_1__.createServerReference)("4202daf3b0bea071d19c70454e177b8a48c3959a");



/***/ })

};
;