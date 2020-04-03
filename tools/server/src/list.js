import m, { trust } from 'mithril';
import { parse } from 'ansicolor';
import { Observable } from './utils/observable';

export const List = {
    view({ attrs }) {
        const { data, scrollToLast, highlight } = attrs;
        const highlightText = Observable.unwrap(highlight);
        return (
            <ul class={`list ${attrs.class}`}>
                {data.map((item, pos) => <Item length={data.length} position={pos} scroll={scrollToLast} message={item.message} label={item.label} highlight={highlightText}></Item>)}
            </ul>
        );
    }
};

const Item = {
    oncreate({ attrs, dom }) {
        const { position, length, scroll } = attrs;
        if (scroll && (position === length - 1)) {
            dom.scrollIntoView({ block: 'center' });
        }
    },
    view({ attrs }) {
        const { label, message, highlight } = attrs;
        const highlightList = highlight.split('|');
        const parsed = parse(message);
        return (
            <li class={highlightList.some(highlight => highlight && label.indexOf(highlight) >= 0) ? 'highlight' : ''}>
                <span class="label">{label}:</span>
                {parsed.spans.map(({ css, text }) => <span style={css}>{text}</span>)}
            </li>
        );
    }
}
