import React from 'react';
import { useState, useEffect } from "react";

import 'firebase/firestore';
import 'firebase/storage';
import firebase from 'firebase/app';

import noThumbnail from './no-thumbnail.jpg';
import ImageModal from './ImageModal';

import CloseIcon from '@material-ui/icons/Cancel';
import { Typography, CardContent, Button } from '@material-ui/core';

export default function Task(props) {
    const [tache, setTache] = useState(props.tache || {});
    const [imgUrl, setImgUrl] = useState(noThumbnail);
    const [collapsed, setCollapsed] = useState(true);
    const [collapsedHeight, setCollapsedHeight] = useState(80);
    const [openTo, setOpenTo] = useState(false);
    const [imgModal, setImgModal] = useState();
    const [imgRetourUrl, setImgRetourUrl] = useState(noThumbnail);
    const storageRef = firebase.storage().ref();

    useEffect(() => {
        let imgName = props.imgName;
        let imgRetourName = props.imgRetourName;
        let imgRef = storageRef.child(imgName);

        imgRef && imgRef.getDownloadURL().then((url) => setImgUrl(url)).catch(error => console.log(error));
        if (imgRetourName && imgRetourName !== '' && imgRetourName !== 'noThumbnail.jpg') {
            let retourImgRef = storageRef.child(imgRetourName);
            retourImgRef.getDownloadURL().then((url) => setImgRetourUrl(url)).catch(error => console.log(error));
        }
    }, []);

    useEffect(() => {
        console.log('\tTache : ', props);

        let imgName = props.imgName;
        let imgRetourName = props.imgRetourName;
        let imgRef = storageRef.child(imgName);

        imgRef && imgRef.getDownloadURL().then((url) => setImgUrl(url)).catch(error => console.log(error));
        if (imgRetourName && imgRetourName !== '' && imgRetourName !== 'noThumbnail.jpg') {
            let retourImgRef = storageRef.child(imgRetourName);
            retourImgRef.getDownloadURL().then((url) => setImgRetourUrl(url)).catch(error => console.log(error));
        }
        if (JSON.stringify(tache) !== JSON.stringify(props.tache)) setTache(props.tache);

    }, [props]);

    const colorizedState = (etat) => {
        let res = "";
        if (etat === 'Non réalisé') res = ' UnmakeState ';
        if (etat === 'Complete') res = ' CompleteState ';
        if (etat === 'Non complete') res = ' UncompleteState ';
        if (etat === 'Annulée') res = ' CancelState ';
        if (etat === 'Refusée') res = ' RejectState ';

        return res
    };

    const toggleCollapse = () => {
        (!collapsed) ? setCollapsedHeight(80) : setCollapsedHeight('none');
        setCollapsed(!collapsed);
    };

    return (
        <CardContent style={{ position: 'relative' }} className={colorizedState(tache.etat)}>
            <Button className="suppressTask" onClick={() => props.suppressTask(tache)}><CloseIcon /></Button>
            <Typography gutterBottom component="h3" style={{ fontSize: '16px', fontWeight: '700' }}>{unescape(tache.tache.title)}</Typography>
            <Typography variant="body2" color="textSecondary" component="div" style={{ display: 'flex' }}>
                <div onClick={toggleCollapse} style={{ flex: 2, fontWeight: '500', fontSize: '12px', overflow: 'hidden', maxHeight: collapsedHeight, cursor: 'pointer' }}>{unescape(tache.tache.description || '')}</div>
                <img src={imgUrl} onClick={() => { setOpenTo(true); setImgModal(imgUrl) }} alt="imgDescription" style={{ marginLeft: '16px', height: '64px', flex: 1, border: '1px solid #ccc' }} />
            </Typography>
            <div className={(tache.retourEtat === '-1') ? "returnTechnicien errorTechnicien" : "returnTechnicien"}>
                {tache.retourEtat === -1 && <div style={{ fontSize: 12, color: '#b00000', margin: '.5em 0' }}>L'intervention n'est pas entierement terminée : {tache.retourRaison} </div>}
                {(tache.retourCommentaire || tache.retourPhoto) && <div style={{ display: 'flex' }}>
                    {tache.retourPhoto && <div> <img onClick={() => { setOpenTo(true); setImgModal(imgRetourUrl) }} style={{ marginRight: '16px', height: '64px', flex: 1, border: '1px solid #ccc' }} src={imgRetourUrl} alt="retour img" /> </div>}
                    {tache.retourCommentaire && <div style={{ fontSize: 12 }}> {tache.retourCommentaire.split('<br />').map((o => <>{o} <br /></>))} </div>}
                    {tache.retourEtat === 1 && <div style={{ fontSize: 12, color: '#1292B4', margin: '.5em 0' }}>L'intervention est terminée</div>}
                </div>}
            </div>
            <ImageModal image={imgModal} openTo={openTo} onClose={() => setOpenTo(false)} />
        </CardContent>
    )
}