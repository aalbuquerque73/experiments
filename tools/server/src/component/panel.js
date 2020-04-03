import m from 'mithril';

export const Panel = {
    view({ attrs, children }) {
        const header = children.filter(child => child && child.attrs && child.attrs.slot === 'header');
        const nav = children.filter(child => child && child.attrs && child.attrs.slot === 'nav');
        const footer = children.filter(child => child && child.attrs && child.attrs.slot === 'footer');
        const content = children.filter(child => child && (!child.attrs || !['header', 'nav', 'footer'].includes(child.attrs.slot)));
        return (
            <div class={`panel ${attrs.class}`}>
                {header.length ? <div class="panel-header">{header}</div> : null}
                {nav.length ? <div class="panel-nav">{nav}</div> : null}
                {content.length ? <div class="panel-body">{content}</div> : null}
                {footer.length ? <div class="panel-footer">{footer}</div> : null}
            </div>
        );
    }
};
