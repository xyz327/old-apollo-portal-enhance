export const DateType = {
    isJson(val) {
        try {
            JSON.parse(val)
            return true
        } catch (e) {
            return false
        }

    }
}