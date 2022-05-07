import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { motion } from 'framer-motion';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<React.StrictMode>
    <motion.div animate={{ opacity: 0.5 }}>hello</motion.div>
</React.StrictMode>)