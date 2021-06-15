import { useEffect, useState } from "react";

const useActiveElement = () => {
    const [activeElement, setActiveElement] = useState<Element>(null);

    useEffect(() => {
        const handleFocusIn = () => {
            if (!document) {
                setActiveElement(null);
                return;
            }
            switch (document.activeElement.tagName) {
                case "INPUT":
                    setActiveElement(document.activeElement);
                    break;
                case "TEXTAREA":
                    setActiveElement(document.activeElement);
                    break;
                case "SELECT":
                    setActiveElement(document.activeElement);
                    break;
                default:
                    setActiveElement(null);
                    break;
            }
        };
        const handleFocusOut = () => {
            if (!document) {
                setActiveElement(null);
                return;
            }
            setActiveElement(null);
        };

        document.addEventListener("focusin", handleFocusIn);
        document.addEventListener("focusout", handleFocusOut);
        return () => {
            document.removeEventListener("focusin", handleFocusIn);
            document.removeEventListener("focusout", handleFocusOut);
        };
    }, []);

    return activeElement;
};

export default useActiveElement;
