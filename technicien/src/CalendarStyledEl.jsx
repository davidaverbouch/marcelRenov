import styled from "styled-components";
import { Button } from '@material-ui/core';


export const CalendarWrapper = styled.div`
    display: flex;
    margin: 12px 16px;
    height: calc(100vh - 300px);
    overflow: auto;
`;

export const CalendarDetailDiv = styled.div`
    position: fixed;
    top: 0px;
    right: 0;
    bottom: 0;
    width: 448px;
    max-width: 100vw;
    z-index: 99;
    background: #f2f8f8;
    border-left: 2px solid #3f51b5;
    padding: 0 24px;
    box-shadow: -6px 6px 7px -5px #777;
    @media (max-width: 768px) {
        border-left: none;
        box-shadow: none;
    }
`;

export const CalendarRowDiv = styled.div`
    flex-wrap: nowrap;
    min-width: 100%;
    display: flex;
    position: relative;
    width: fit-content;
    flex-direction: column;
    height: fit-content;
`;

export const InterventionButton = styled(Button)`
    display: block !important;
    padding: 12px 6px !important;
    font-size: 14px !important;
    text-transform: none !important;
    line-height: 1.1 !important;
    color: ${props => props.colortext} !important;
    border: 1px solid #aaa !important;
    background: #fff !important;
    overflow: hidden;
    margin: 8px 0 !important;
    width: 100%;
    box-shadow: 0px 6px 6px -6px #777;
    border: 1px solid #f1f5f5 !important;
`;

export const IdentitiesDiv = styled.div`
    display: block !important;
    padding: 24px 12px !important;
    font-size: 14px !important;
    text-transform: none !important;
    line-height: 1.1 !important;
    color: #3f51b5 !important;
    background: #fff !important;
    overflow: hidden;
    margin: 20px 0 !important;
    width: 100%;
    box-shadow: 0px 6px 6px -6px #777;
    border: 1px solid #3f51b5 !important;
    ${props => props.nopaddingbottom ? 'padding-bottom: 12px !important;' : ''}
`;
