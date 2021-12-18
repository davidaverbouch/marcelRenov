import styled from "styled-components";
import { Button } from '@material-ui/core';


export const CalendarWrapper = styled.div`
    display: flex;
    flex-wrap: nowrap;
    overflow: auto;
    flex-direction: column;
    border: 1px solid #3f51b5;
    border-radius: 12px;
    margin: 16px 24px;
    box-shadow: 0px 2px 6px 1px #ccc;
    background: white;
`;

export const CalendarDetailDiv = styled.div`
    position: fixed;
    top: 60px;
    right: 0;
    bottom: 0;
    width: 448px;
    max-width: 100vw;
    z-index: 99;
    background: #f2f8f8;
    border-left: 2px solid #3f51b5;
    padding: 0 24px;
    box-shadow: -6px 6px 7px -5px #777;
`;

export const CalendarRowDiv = styled.div`
    flex-wrap: nowrap;
    min-width: 100%;
    display: flex;
    position: relative;
    width: fit-content;
    border-bottom: ${props => props.showRules ? '1px solid #3f51b5' : '1px solid #f2f8f9'};
    border-top: ${props => props.showRules && (props.indexRow === 0) ? '1px solid #3f51b5' : props.showRules ? '1px solid #3f51b5' : ((props.indexRow < 0) ? '1px solid #f2f8f9' : 'none')};
`;

export const Case = styled.div`
    position: relative;
    flex: 1;
    min-width: 16px;
    max-width: 150px;
    border-left: none;
    padding: ${props => (props.head ? '4px 8px' : '0')};
    display: flex;
    align-item: center;
    justify-content: center;
    margin: 0;
    border-right-color: ${props => (props.hours || props.half ? '#3f51b5' : '#e3f3f3')};
    border-right-style: ${props => (props.hours ? 'solid' : (props.half ? 'dotted' : 'dashed'))};
    border-right-width: 1px;

    ${props => (props.head ? 'z-index: 50; padding-top: 1rem; padding-bottom: 1rem; background-color: #3f51b5; top: 0; left: 0; bottom: 0; color: white; position: sticky; border: 1px solid #3f51b5; min-width: 128px;' : '')}
    ${props => (props.head && props.showRules ? 'color: transparent;' : '')}
    ${props => (props.showRules ? 'height: 32px' : '')}
`;

export const CaseSpan = styled.span`
    position: ${props => (props.head ? 'relative' : 'absolute')};
    transform: ${props => (props.showRules ? 'translateX(50%)' : 'none')};
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    font-size: 11px;
    font-weight: 700;
    background: ${props => (props.showRules ? 'white' : 'transparent')};
    color: ${props => (props.showRules && props.i === 0 ? 'transparent' : 'black')}; 

    ${props => (props.head ? 'width: 100%; min-height: 16px; background: none;' : '')}
`;

export const InterventionButton = styled(Button)`
    display: block !important;
    padding: 6px !important;
    font-size: 12px !important;
    text-transform: none !important;
    line-height: 1.1 !important;
    color: #fff !important;
    border-radius: 8px !important;
    border: 1px solid #ccc !important;
    background: ${props => (props.background ? props.background + '!important' : '#e99806 !important')};
    position: absolute !important;
    top: 4px;
    left: 1px;
    bottom: 4px;
    width: ${props => (props.quarter ? props.quarter + '%' : '0')};
    overflow: hidden;
    word-break: break-all;
    text-overflow: ellipsis;
    z-index: 25;
    opacity: ${props => (props.opacity ? .66 : 1)} !important;
    box-shadow: 0px 3px 5px -1px rgb(0 0 0 / 20%), 0px 6px 10px 0px rgb(0 0 0 / 14%), 0px 1px 18px 0px rgb(0 0 0 / 12%);
`;
