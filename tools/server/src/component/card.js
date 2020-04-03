import m from 'mithril';

export const Card = {
    view({ attrs, children }) {
        const header = children.filter(child => child && child.attrs && child.attrs.slot === 'header');
        const nav = children.filter(child => child && child.attrs && child.attrs.slot === 'nav');
        const footer = children.filter(child => child && child.attrs && child.attrs.slot === 'footer');
        const content = children.filter(child => child && (!child.attrs || !['header', 'nav', 'footer'].includes(child.attrs.slot)));
        return (
            <div class={`card ${attrs.class}`}>
                {header.length ? <div class="card-header">{header}</div> : null}
                {nav.length ? <div class="card-nav">{nav}</div> : null}
                {content.length ? <div class="card-body">{content}</div> : null}
                {footer.length ? <div class="card-footer">{footer}</div> : null}
            </div>
        );
    }
};
