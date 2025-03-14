// @ts-nocheck

module.exports.render = component => {
    const doctype =
        '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">';
    const markup = ReactDOMServer.renderToStaticMarkup(component);
    return `${doctype}${markup}`;
};
