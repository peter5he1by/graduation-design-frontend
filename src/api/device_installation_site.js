import service from "@/api/request";

const root = '/installation_site'
const deviceInstallationSite = {
    getTree(parent) {
        return service({
            url: `${root}/get_tree`,
            method: 'post',
            data: {
                'parent': parent || null
            }
        })
    },
    setParent(self, parent) {
        return service({
            url: `${root}/set_parent`,
            method: 'post',
            data: {
                self,
                parent
            }
        })
    },
    add(parentId, name, description) {
        return service({
            url: `${root}/add`,
            method: 'post',
            data: {
                parent: parentId,
                name,
                description
            }
        })
    },
    delete(id) {
        return service({
            url: `${root}/delete`,
            method: 'post',
            data: {
                id
            }
        })
    },
    edit(id, name, description) {
        return service({
            url: `${root}/edit`,
            method: 'post',
            data: {
                id, name, description
            }
        })
    }
}
export default deviceInstallationSite

