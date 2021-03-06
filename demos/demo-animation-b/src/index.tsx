import { mix } from "@popmotion/popcorn";
import { animate, AnimatePresence, motion, MotionValue, Reorder, useMotionValue, useTransform } from 'framer-motion';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { Case17 } from "./case17";

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
    <BrowserRouter>
        <Routes>
            <Route index element={<ul>
                <li><Link to="case1">Case1</Link></li>
                <li><Link to="case2">Case2</Link></li>
                <li><Link to="case3">Case3</Link></li>
                <li><Link to="case4">Case4</Link></li>
                <li><Link to="case5">Case5</Link></li>
                <li><Link to="case6">Case6</Link></li>
                <li><Link to="case7">Case7</Link></li>
                <li><Link to="case8">Case8</Link></li>
                <li><Link to="case9">Case9</Link></li>
                <li><Link to="case10">Case10</Link></li>
                <li><Link to="case11">Case11</Link></li>
                <li><Link to="case12">Case12</Link></li>
                <li><Link to="case17">Case17</Link></li>
            </ul>} />
            <Route path='case1' element={<Case1 />} />
            <Route path='case2' element={<Case2 />} />
            <Route path='case3' element={<Case3 />} />
            <Route path='case4' element={<Case4 />} />
            <Route path='case5' element={<Case5 />} />
            <Route path='case6' element={<Case6 />} />
            <Route path='case7' element={<Case7 />} />
            <Route path='case8' element={<Case8 />} />
            <Route path='case9' element={<Case9 />} />
            <Route path='case10' element={<Case10 />} />
            <Route path='case11' element={<Case11 />} />
            <Route path='case12' element={<Case12 />} />
            <Route path='case17/*' element={<Case17 />} />
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

function Case4() {
    const [isVisible, setVisible] = React.useState(true);
    React.useLayoutEffect(() => {
        setTimeout(() => {
            console.log('set to false');
            setVisible(false);
        }, 3000);
    }, []);
    return <AnimatePresence>
        <div key="a">===</div>
        {isVisible && (
            <motion.div
                key="b"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2 }}
            >Hello World</motion.div>
        )}
        <div key="c">~~~</div>
    </AnimatePresence>
}

function Case5() {
    const [justifyContent, setJustifyContent] = React.useState('flex-start');
    return <div style={{ left: '200px', top: '100px', width: '500px', display: 'flex', justifyContent }}
        onClick={() => { setJustifyContent('flex-end'); }}>
        <Case5_Child />
    </div>
}

const Case5_Child = /*React.memo*/(() => {
    return <motion.div layout style={{ width: '50px', height: '20px', backgroundColor: 'red' }}></motion.div>;
})

function Case6() {
    return <motion.div style={{ marginLeft: '100px', marginTop: '100px', width: 'fit-content' }} whileHover={{ scale: 1.2 }}>Hello World</motion.div>
}

function Case7() {
    return <div>
        <motion.input whileFocus={{ scale: 1.2 }}></motion.input>
        <motion.a href="#">world</motion.a>
    </div>
}

function Case8() {
    return <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 2 }} style={{ marginTop: '120vh', width: '50px', height: '20px', backgroundColor: 'red' }}></motion.div>
}

function Case9() {
    import('./case9.css');
    const tabs = [{ icon: "????", label: "Tomato" }, { icon: "????", label: "Lettuce" }, { icon: "????", label: "Cheese" }];
    const [selectedTab, setSelectedTab] = React.useState(tabs[2]);

    return <div className="window">
        <nav>
            <ul>
                {tabs.map((item) => (
                    <li
                        key={item.label}
                        className={item === selectedTab ? "selected" : ""}
                        onClick={() => setSelectedTab(item)}
                    >
                        {`${item.icon} ${item.label}`}
                        {item === selectedTab ? (
                            <motion.div className="underline" layoutId="underline" />
                        ) : null}
                    </li>
                ))}
            </ul>
        </nav>
        <main>
            <AnimatePresence exitBeforeEnter>
                <motion.div
                    key={selectedTab ? selectedTab.label : "empty"}
                    animate={{ opacity: 1, y: 0 }}
                    initial={{ opacity: 0, y: 20 }}
                    exit={{ opacity: 0, y: -90 }}
                    transition={{ duration: 0.5 }}
                >
                    {selectedTab ? selectedTab.icon : "????"}
                </motion.div>
            </AnimatePresence>
        </main>
    </div>
}

function Case10() {
    import('./case10.css');
    const [expanded, setExpanded] = React.useState<false | number>(0);
    const accordionIds = [0, 1, 2, 3];
    return <>{
        accordionIds.map((i) => (
            <React.Fragment key={i}>
                <motion.header
                    initial={false}
                    animate={{ backgroundColor: i === expanded ? "#FF0088" : "#0055FF" }}
                    onClick={() => setExpanded(i === expanded ? false : i)}
                />
                <AnimatePresence initial={false}>
                    {i === expanded && (
                        <motion.section
                            key="content"
                            initial="collapsed"
                            animate="open"
                            exit="collapsed"
                            variants={{
                                open: { opacity: 1, height: "auto" },
                                collapsed: { opacity: 0, height: 0 }
                            }}
                            transition={{ duration: 0.8, ease: [0.04, 0.62, 0.23, 0.98] }}
                        >
                            <ContentPlaceholder />
                        </motion.section>
                    )}
                </AnimatePresence>
            </React.Fragment>
        ))
    }</>;
}


const randomInt = (min: number, max: number) => Math.round(mix(min, max, Math.random()));
const generateParagraphLength = () => randomInt(5, 20);
const generateWordLength = () => randomInt(20, 100);

// Randomly generate some paragraphs of word lengths
const paragraphs = [...Array(3)].map(() => {
    return [...Array(generateParagraphLength())].map(generateWordLength);
});

const Word = ({ width }: any) => <div className="word" style={{ width }} />;

const Paragraph = ({ words }: any) => (
    <div className="paragraph">
        {words.map((width: any, i: any) => (
            <Word key={i} width={width} />
        ))}
    </div>
);

const ContentPlaceholder = () => (
    <motion.div
        variants={{ collapsed: { scale: 0.8 }, open: { scale: 1 } }}
        transition={{ duration: 0.8 }}
        className="content-placeholder"
    >
        {paragraphs.map((words, i) => (
            <Paragraph key={i} words={words} />
        ))}
    </motion.div>
);

const initialItems = ["???? Tomato", "???? Cucumber", "???? Cheese", "???? Lettuce"];

function Case11() {
    import('./case11.css');
    const [items, setItems] = React.useState(initialItems);

    return (
        <Reorder.Group axis="y" onReorder={setItems} values={items}>
            {items.map((item) => (
                <Item key={item} item={item} />
            ))}
        </Reorder.Group>
    )
}

const Item = ({ item }: { item: string }) => {
    const y = useMotionValue(0);
    const boxShadow = useRaisedShadow(y);

    return (
        <Reorder.Item value={item} id={item} style={{ boxShadow, y }}>
            <span>{item}</span>
        </Reorder.Item>
    );
};

const inactiveShadow = "0px 0px 0px rgba(0,0,0,0.8)";

function useRaisedShadow(value: MotionValue<number>) {
    const boxShadow = useMotionValue(inactiveShadow);

    React.useEffect(() => {
        let isActive = false;
        value.onChange((latest) => {
            const wasActive = isActive;
            if (latest !== 0) {
                isActive = true;
                if (isActive !== wasActive) {
                    animate(boxShadow, "5px 5px 10px rgba(0,0,0,0.3)");
                }
            } else {
                isActive = false;
                if (isActive !== wasActive) {
                    animate(boxShadow, inactiveShadow);
                }
            }
        });
    }, [value, boxShadow]);

    return boxShadow;
}

const items = [0, 1, 2, 3, 4];
const height = 70;
const padding = 10;
const size = 150;

function Case12() {
    import('./case12.css');
    const scrollY = useMotionValue(0);
    const scale = useTransform(scrollY, [0, 100], [0, 1]);
    const opacity = useTransform(scrollY, [0, 100], [0, 1]);

    return (
        <>
            <motion.div
                style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: "#fff",
                    position: "absolute",
                    top: "50%",
                    marginTop: -85,
                    left: "50%",
                    marginLeft: -20,
                    scale: scale,
                    opacity: opacity
                }}
            />
            <motion.div
                style={{
                    width: 150,
                    height: 150,
                    borderRadius: 30,
                    overflow: "hidden",
                    position: "relative",
                    transform: "translateZ(0)",
                    cursor: "grab"
                }}
                whileTap={{ cursor: "grabbing" }}
            >
                <motion.div
                    style={{
                        width: 150,
                        height: getHeight(items),
                        y: scrollY
                    }}
                    drag="y"
                    dragConstraints={{
                        top: -getHeight(items) + size,
                        bottom: 0
                    }}
                >
                    {items.map((index) => {
                        return (
                            <motion.div
                                style={{
                                    width: 150,
                                    height: height,
                                    borderRadius: 20,
                                    backgroundColor: "#fff",
                                    marginBottom:
                                        index !== items.length - 1 ? 10 : 0
                                }}
                                key={index}
                            />
                        );
                    })}
                </motion.div>
            </motion.div>
        </>
    );
}

function getHeight(items: any[]) {
    const totalHeight = items.length * height;
    const totalPadding = (items.length - 1) * padding;
    const totalScroll = totalHeight + totalPadding;
    return totalScroll;
}
