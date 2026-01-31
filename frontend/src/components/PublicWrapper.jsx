import React from 'react';
import { AlarmProvider } from '../context/AlarmContext';
import Layout from './Layout';

const PublicWrapper = () => {
    return (
        <AlarmProvider>
            <Layout />
        </AlarmProvider>
    );
};

export default PublicWrapper;
