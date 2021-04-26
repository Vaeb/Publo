export const copyText = (elId: string): void => {
    if (!window) return;

    window.getSelection()?.selectAllChildren(
        document.getElementById(elId) as Node
    );

    /* Copy the text inside the text field */
    document.execCommand('copy');
};
