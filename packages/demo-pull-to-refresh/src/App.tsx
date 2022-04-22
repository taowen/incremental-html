import { motion, useAnimation, useMotionValue } from 'framer-motion';
import React, { useRef } from "react";

export default function () {
    const refContainer = useRef<HTMLDivElement>();
    const dragY = useMotionValue(0);
    const y = useMotionValue(0);
    const animation = useAnimation();
    const handleDrag = (e, panInfo) => {
        const dragYValue = dragY.get();
        if (dragYValue > 0 && dragYValue < 50) {
            y.set(dragYValue);
        } else {
            refContainer.current.scrollTop = -dragYValue;
        }
    };
    return <div ref={refContainer} style={{
        marginLeft: 200,
        marginTop: 50,
        marginRight: 200,
        height: 300,
        border: '1px solid black',
        overflow: 'scroll'
    }}>
        <motion.div style={{ y }} animate={animation} drag="y" _dragY={dragY} dragConstraints={refContainer}
            onDrag={handleDrag} onDragStart={handleDrag} onDragEnd={async (e, panInfo) => {
                if (y.get() === 0) {
                    dragY.stop();
                } else {
                    refContainer.current.style.overflow = 'hidden';
                    await animation.start({
                        y: 0,
                        transition: { type: 'spring' },
                    })
                    refContainer.current.style.overflow = 'scroll';
                }
            }}>
            <div>as213df</div>
            <div>asdf</div>
            <div>asdf</div>
            <div>asdf</div>
            <div>asdf</div>
            <div>asdf</div>
            <div>asdf</div>
            <div>asdf</div>
            <div>asdf</div>
            <div>asdf</div>
            <div>asdf</div>
            <div>asdf</div>
            <div>12311</div>
            <div>as213df</div>
            <div>asdf</div>
            <div>a333sdf</div>
            <div>asdf</div>
            <div>asd123f</div>
            <div>asdf</div>
            <div>asdf</div>
            <div>asdf</div>
            <div>asdf</div>
            <div>as213df</div>
            <div>asdf</div>
            <div>asdf</div>
            <div>asdf</div>
            <div>asdf</div>
            <div>as213df</div>
            <div>asdf</div>
            <div>asdf</div>
            <div>asdf</div>
            <div>asdf</div>
            <div>asdf</div>
            <div>asdf</div>
            <div>asdf</div>
            <div>asdf</div>
            <div>asdf</div>
            <div>asdf</div>
            <div>asdf</div>
            <div>asdf</div>
            <div>asdf</div>
        </motion.div>
    </div>
}