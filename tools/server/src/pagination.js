import m from 'mithril';
import { Bus } from './utils/bus';

export const Pagination = {
    oninit() {
        this.click = (ev) => {
            ev.preventDefault();
            const dir = ev.target.innerText.trim();
            Bus.emit('page', dir);
        };
    },
    view({ attrs }) {
        const { currentPage, pageCount } = attrs;
        const prev = currentPage === 1 ? 'disabled' : '';
        const next = currentPage === pageCount ? 'disabled' : '';
        const list = Array(5)
            .fill(0)
            // eslint-disable-next-line no-nested-ternary
            .map((_, ind) => currentPage + ind - (currentPage < 4 ? currentPage - 2 : currentPage > pageCount - 3 ? 4 - pageCount + currentPage : 2))
            .filter(num => num > 0 && num <= pageCount);
        let first = 0;
        if (list[first] > 2) {
            list.unshift('...');
            // eslint-disable-next-line no-plusplus
            ++first;
        }
        if (list[first] > 1) {
            list.unshift(1);
        }
        let last = list.length - 1;
        if (list[last] < pageCount - 1) {
            list.push('...');
            // eslint-disable-next-line no-plusplus
            --last;
        }
        if (list[last] < pageCount) {
            list.push(pageCount);
        }
        if (list.length === 0) {
            return null;
        }
        return (
            <ul class="pagination">
                <li class={`page-item ${prev}`}>
                    <a href="#" tabindex={prev === 'disabled' ? -1 : null} onclick={this.click}>Previous</a>
                </li>
                {list.map(num => <PageItem page={num} active={currentPage}></PageItem>)}
                <li class={`page-item ${next}`}>
                    <a href="#" tabindex={prev === 'disabled' ? -1 : null} onclick={this.click}>Next</a>
                </li>
            </ul>
        );
    }
};

const PageItem = {
    oninit() {
        this.click = (ev) => {
            ev.preventDefault();
            const dir = ev.target.innerText.trim();
            Bus.emit('page', dir);
        };
    },
    view({ attrs }) {
        const { page, active } = attrs;
        if (page === '...') {
            return (
                <li class="page-item"><span>{page}</span></li>
            );
        }
        return (
            <li class={`page-item ${active === page ? 'active' : ''}`}><a href={`#page/${page}`} onclick={this.click}>{page}</a></li>
        );
    }
};
