const functions = require("firebase-functions");
const admin = require('firebase-admin');
admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
// exports.addIntervention = functions.https.onRequest(async (req, res) => {
//     // recuperer la valeur de la clé
//     const jsonInter = JSON.parse(req.query.json);
//     // Push the new message into Firestore using the Firebase Admin SDK.
//     const writeResult = await admin.firestore().collection('interventions').add(jsonInter);

//     const readResult = await admin.firestore().collection('users').doc(jsonInter.technicien).get('interventionsList');

//     let interList = readResult.data();
//     let d = jsonInter.date.split(' ')[0];
//     if (!interList[d]) interList[d] = {};
//     interList[d][writeResult.id] = new Date().getTime();
//     const writeResult2 = await admin.firestore().collection('users').doc(jsonInter.technicien).set({ interventionsList: interList });

//     const writeResult3 = await admin.firestore().collection('reducedInfo').doc(writeResult.id).add({ etat: jsonInter.etat, keywords: [jsonInter.nom, jsonInter.prenom, jsonInter.adresse, jsonInter.titre, jsonInter.id] });

//     res.json({ result: `Message with ID: ${writeResult.id} added, and ${interList} : ${writeResult2} , keywords: ${writeResult3}` });
// });

// exports.ajouterIntervention = functions.firestore.document('/interventions/{documentId}')
//     .onWrite((snap, context) => {
//         // recuperation des données ecrites dans firestore
//         const data = snap.data();
//         const idInter = context.params.documentId;

//         return admin.firestore().collection('users').doc(data.technicien).get('interventionsList').then(doc => {
//             let interList = doc.data();
//             let d = data.date.split(' ')[0];
//             if (!interList[d]) interList[d] = {};
//             interList[d][idInter] = new Date().getTime();

//             return admin.firestore().collection('users').doc(data.technicien).set({ interventionsList: interList }).then(document => {
//                 return admin.firestore().collection('reducedInfo').doc(writeResult.id).add({ etat: data.etat, keywords: [data.nom, data.prenom, data.adresse, data.titre, data.id] });
//             })
//         });

//     });

console.log(functions);
