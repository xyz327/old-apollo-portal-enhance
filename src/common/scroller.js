export function scrollTo(el) {
    $(el)[0].scrollIntoView({ behavior: 'smooth' })
}