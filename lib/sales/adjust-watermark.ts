import { _useId } from "@/hooks/use-id";

export function adjustWatermark(orderIds: string[]) {
  const w = document.getElementById("waterMark");
  console.log(w);
  //   return;
  let pages = 0;
  orderIds.map((elementId) => {
    let pgHeight, invoiceHeight;
    pgHeight = 850;
    invoiceHeight = 950;
    const selector = (s) => `#s${elementId} ${s}`;
    const header = document.querySelector(selector("#topHeader"));
    const headerHeight = header?.clientHeight;
    invoiceHeight -= headerHeight;
    const footer = document.querySelector(selector("#footer"));
    invoiceHeight -= footer?.clientHeight;
    console.log(invoiceHeight, pgHeight);
    let totalLineHeight = 0;
    document.querySelectorAll(selector("tbody  tr")).forEach((e, i) => {
      // console.log([e.id, e.clientHeight, th]);
      if (e.id == "filler") {
        // e.classList.remove('hidden');
        // console.log(e);
        // console.log(e.querySelector('td div#filler'));
      } else totalLineHeight += e.clientHeight;
    });
    const lp = totalLineHeight % invoiceHeight;
    const px = invoiceHeight - lp;
    const fl: HTMLElement = document.querySelector(selector("div#filler"));
    let _pgs = Math.ceil(totalLineHeight / invoiceHeight);
    console.log({
      totalLineHeight,
      invoiceHeight,
      px,
      _pgs,
    });
    for (let i = 0; i < _pgs; i++) {
      const n = w.cloneNode(true) as HTMLElement;
      n.setAttribute("id", _useId("water"));
      n.classList.remove("hidden");
      const topPx = Math.ceil(
        pgHeight * pages + headerHeight + invoiceHeight / 2
      );
      // console.log([pgHeight, pages, headerHeight, invoiceHeight]);
      n.style.top = `${topPx}px`;
      // console.log([topPx]);
      w.after(n);
      pages++;
    }
    console.log(pages);
    if (fl) {
      const h = `${px}px`;
      //   fl.style.height = h;
    }
  });
}
