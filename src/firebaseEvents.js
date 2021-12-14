import { collection, doc, setDoc, updateDoc, getDocs, arrayUnion, arrayRemove, query, where } from "firebase/firestore";
import { db, firebase } from "../firebase/firebase.js";
import { Timestamp } from "@firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseNewEvent = async (data) => {
    // Add a new document with a generated id
    const newEventRef = doc(collection(db, "events"));

    await setDoc(newEventRef, data);
};

const firebaseUpdateEvent = async (data, id) => {
    // Find document with user-provided id
    const eventRef = doc(db, "events", id);

    // Update the document data
    await updateDoc(eventRef, {
        attendees: data.attendees,
        description: data.description,
        manager: data.manager,
        name: data.name,
        division: data.division,
        startTime: data.startTime,
        endTime: data.endTime
    });
};

const firebaseAppendUser = async (user, id) => {
    const eventRef = doc(db, "events", id);
    const userRef = doc(db, "users", id);

    await updateDoc(eventRef, {
        attendees: arrayUnion(userRef)
    });
}

const firebaseRemoveUser = async (user, id) => {
    const eventRef = doc(db, "events", id);
    const userRef = doc(db, "users", id);

    await updateDoc(eventRef, {
        attendees: arrayRemove(userRef)
    });
}

const firebaseFilterEvents = async (theMonth, divisions, showEnrolled) => {
    const events = collection(db, "events");
    let filtered_events = [];

    let q = query(events, where("division", "in", divisions));

    if (showEnrolled) {
        let user_id = getAuth().currentUser.uid;
        q = query(events, where("division", "in", divisions), where("attendees", "array-contains", user_id));
    }

    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
        var timestamp = doc.data().startTime;
        if (timestamp.toDate().getMonth() == theMonth) {
            console.log("added!")
            filtered_events.push(doc);
        }
    });
}

export { firebaseNewEvent, firebaseUpdateEvent, firebaseAppendUser, firebaseRemoveUser, firebaseFilterEvents };
