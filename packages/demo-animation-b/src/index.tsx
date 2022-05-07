import { motion } from 'framer-motion';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import {
    BrowserRouter, Link, Route, Routes
} from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
    <BrowserRouter>
        <Routes>
            <Route index element={<ul>
                <li><Link to="case1">Case1</Link></li>
                <li><Link to="case2">Case2</Link></li>
                <li><Link to="case3">Case3</Link></li>
            </ul>} />
            <Route path='case1' element={<Case1 />} />
            <Route path='case2' element={<Case2 />} />
            <Route path='case3' element={<Case3 />} />
        </Routes>
    </BrowserRouter>)

function Case1() {
    return <motion.div animate={{ opacity: 0.5 }}>hello</motion.div>
}

function Case2() {
    const [x, setX] = React.useState(0);
    return <motion.div style={{ width: 100 }} animate={{ x }} onClick={() => {
        setX(100);
    }}>click me</motion.div>
}

function Case3() {
    return <motion.div animate={{ x: 100 }} transition={{ delay: 1 }}>hello</motion.div>
}