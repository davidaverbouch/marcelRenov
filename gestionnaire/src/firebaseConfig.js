import { initializeApp, getApps } from "@firebase/app";
import { getAnalytics } from "@firebase/analytics";
import { getAuth, onAuthStateChanged } from "@firebase/auth";
import {
    getFirestore,
    collection,
    query,
    where,
    addDoc,
    getDocs,
    getDoc,
    doc,
    setDoc,
    updateDoc,
    deleteDoc,
    deleteField,
    onSnapshot
} from "@firebase/firestore";
import { getStorage } from "firebase/storage";

/***********************  ***********************/
const firebaseConfig = {
    apiKey: "AIzaSyBLZSubv92m22fEDq0Ok25fO0FBboVP4NE",
    authDomain: "marcelrenov-web.firebaseapp.com",
    projectId: "marcelrenov-web",
    storageBucket: "marcelrenov-web.appspot.com",
    messagingSenderId: "286713953813",
    appId: "1:286713953813:web:2a542ad866caaa033c181c",
    measurementId: "G-BR21R83LHZ"
};

// initialize or load firebase
const app = (getApps().length > 0) ? getApps() : initializeApp(firebaseConfig);

/*********************** Analytics ***********************/
export const analytics = getAnalytics(app);

/*********************** Auth ***********************/
export const auth = getAuth(app);

/*********************** Firestore ***********************/
export const db = getFirestore(app);
export async function firestoreQuery(dbName, callback) {
    let res = {};
    const q = query(collection(db, dbName));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => res[doc.id] = doc.data());
    callback(res);

    return res;
};
export async function getFirestoreReducedInfo(callback) {
    const q = query(collection(db, "reducedInfo"));
    return onSnapshot(q, (snapshot) => {
        let doc = snapshot.docs && snapshot.docs.map(o => { return { ...o.data(), uid: o.id }; });
        if (doc) callback(doc);
    });
};
export async function getFirestoreUsers(callback) {
    const q = query(collection(db, "users"));
    return onSnapshot(q, (snapshot) => {
        let doc = snapshot.docs && snapshot.docs.map(o => { return { ...o.data(), uid: o.id }; });
        if (doc) callback(doc);
    });
};
export async function getInter(idInter, callback) {
    // const unsub = onSnapshot(doc(db, "interventions", idInter), (snapshot) => {
    //     console.log(snapshot.docs)

    //     let doc = snapshot.docs && snapshot.docs.map(o => { return { ...o.data(), id: o.id }; });
    //     if (doc) {
    //         console.log("Current data: ", doc, doc[0].data(), doc[0].id);
    //         callback({ ...doc[0].data(), uid: doc[0].id });
    //     }
    // });

    const docRef = doc(db, "interventions", idInter);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) callback({ ...docSnap.data(), uid: idInter });

    return docSnap;
};
export async function addInterRedux(newDoc, callback) {
    const nDoc = await addDoc(collection(db, 'interventions'), { ...newDoc, history: { [new Date().toLocaleString().replaceAll('/', '_')]: 'creation par $$' + newDoc.gestionnaire + '$$' } });
    callback({ functionName: 'addInterRedux', id: nDoc.id });
    return nDoc.id;
};
export async function editInterRedux(newDoc, callback) {
    await updateDoc(doc(db, 'interventions', newDoc.uid), { ...newDoc, [`history.${[new Date().toLocaleString().replaceAll('/', '_')]}`]: 'changement des informations par $$' + newDoc.gestionnaire + '$$' });
    callback({ functionName: 'editInterRedux', id: newDoc.uid });
    return newDoc.uid;
};
export async function deleteInterRedux(newDoc, callback) {
    await deleteDoc(doc(db, 'interventions', newDoc.uid));
    await deleteDoc(doc(db, 'reducedInfo', newDoc.uid));

    const col = doc(db, 'users', newDoc.technicien);
    await updateDoc(col, {
        [`interventionsList.${newDoc.date.split(' ')[0].replaceAll('/', '_')}.${newDoc.uid}`]: deleteField()
    });

    callback({ functionName: 'deleteInterRedux', id: newDoc.uid });
    return newDoc.uid;
};
export async function reaffectInterRedux(oldDoc, newDoc, callback) {
    deleteInterRedux(oldDoc, ({ functionName, id }) => console.log('\tReaffect - ' + functionName, id));

    const nDoc = await addDoc(collection(db, 'interventions'), { ...newDoc, history: { ...oldDoc.history, [new Date().toLocaleString().replaceAll('/', '_')]: 'réaffectation par $$' + newDoc.gestionnaire + '$$' } });

    console.log('\tReaffect - addInterRedux', nDoc.id);
    addUserInterventionList({ ...newDoc, uid: nDoc.id }, ({ functionName, idUserList }) => { console.log('\tReaffect - ' + functionName, idUserList); });
    addReducedInfo({ ...newDoc, uid: nDoc.id }, ({ functionName, idReducedInfo }) => { console.log('\tReaffect - ' + functionName, idReducedInfo); });

    callback({ functionName: 'reaffectInterRedux', id: newDoc.uid });
    return newDoc.uid;
};
export async function stateInterRedux(newDoc, callback) {
    console.log(newDoc)
    await updateDoc(doc(db, 'interventions', newDoc.uid), { etat: newDoc.etat, [`history.${[new Date().toLocaleString().replaceAll('/', '_')]}`]: 'changement de l\'état par $$' + newDoc.gestionnaire + '$$' });
    await updateDoc(doc(db, 'reducedInfo', newDoc.uid), { etat: newDoc.etat });

    const col = doc(db, 'users', newDoc.technicien);
    await updateDoc(col, {
        [`interventionsList.${newDoc.date.split(' ')[0].replaceAll('/', '_')}.${newDoc.uid}`]: new Date().getTime()
    });

    callback({ functionName: 'stateReducedInfo', id: newDoc.uid });
    return newDoc.uid;
};
export async function addReducedInfo(newDoc, callback) {
    await setDoc(doc(db, 'reducedInfo', newDoc.uid), { etat: newDoc.etat, keywords: [newDoc.id, newDoc.titre, newDoc.nom, newDoc.prenom, newDoc.adresse, newDoc.date, newDoc.technicien] });
    callback({ functionName: 'addReducedInfo', id: newDoc.uid });
    return newDoc.uid;
};
export async function addUserInterventionList(newDoc, callback) {
    const col = doc(db, 'users', newDoc.technicien);
    await updateDoc(col, {
        [`interventionsList.${newDoc.date.split(' ')[0].replaceAll('/', '_')}.${newDoc.uid}`]: new Date().getTime()
    });
    callback({ functionName: 'addUserInterventionList', id: newDoc.uid });
    return newDoc.uid;
};

// export async function firestoreQuery(dbName, { key = '*', symbol = '==', value = '*' }) {
//     const q = query(collection(db, dbName), where(key, symbol, value));
//     const querySnapshot = await getDocs(q);
//     querySnapshot.forEach((doc) => {
//         console.log(doc.id, " => ", doc.data());
//         // enregistrer dans redux les datas
//     });
// };

/*********************** Storage ***********************/
export const storage = getStorage(app);
