import React from 'react';
import { useState, useEffect } from "react";

import CloseIcon from '@material-ui/icons/Close';
import { Dialog, DialogContent, Slide, IconButton } from '@material-ui/core';

import noThumbnail from './no-thumbnail.jpg';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function ImageModal(props) {
    const [image, setImage] = useState(props.image || noThumbnail);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (props.image !== image) setImage(props.image);
        if (props.openTo !== open) setOpen(props.openTo);
    }, [props]);

    const close = () => {
        props.onClose && props.onClose(false);
        setOpen(false);
    }

    return (
        <Dialog fullScreen open={open} TransitionComponent={Transition} keepMounted onClose={close} >
            <IconButton style={{ position: 'absolute', background: 'rgba(240, 240, 240, .75)', right: '1em', top: '1em' }} edge="start" color="inherit" onClick={close} aria-label="close">
                <CloseIcon style={{ fontSize: 36 }} />
            </IconButton>
            <DialogContent style={{ background: '#555' }}>
                <img src={image} alt="" style={{ maxHeight: '100%', maxWidth: '100%', margin: 'auto', display: 'block' }} />
            </DialogContent>
        </Dialog>
    );
}