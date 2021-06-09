export const dateService = {
    UTCToLocal
};

function UTCToLocal(date) {
    if (date===null){
        return ''
    }

    date = new Date(Date.parse(date))
    let ye = new Intl.DateTimeFormat('de', {year: 'numeric'}).format(date);
    let mo = new Intl.DateTimeFormat('de', {month: '2-digit'}).format(date);
    let da = new Intl.DateTimeFormat('de', {day: '2-digit'}).format(date);
    let hh = new Intl.DateTimeFormat('de', { hour:  "numeric", minute: "2-digit"}).format(date);
    return `${da}.${mo}.${ye} ${hh}`
}
