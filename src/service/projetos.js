import localforage from 'localforage'

const loja = localforage.createInstance({ name: 'editor-design' })

const chave = (categoria) => `projetos:${categoria}`


export async function listarProjetos(categoria) {
    return (await loja.getItem(chave(categoria))) || []
}


export async function salvarProjeto(categoria, projeto) {

    const lista = await listarProjetos(categoria)

    const indice = lista.findIndex(p => p.id === projeto.id)

    if (indice >= 0) {
        lista[indice] = projeto      // atualiza, sem duplicar
    } else {
        lista.unshift(projeto)
    }

    await loja.setItem(chave(categoria), lista)
}


export async function removerProjeto(categoria, id) {

    const lista = await listarProjetos(categoria)

    await loja.setItem(
        chave(categoria),
        lista.filter(p => p.id !== id)
    )
}

export const CATEGORIAS = {
    favoritos: { titulo: 'Favoritos',              icone: 'star-outline'     },
    mpj:       { titulo: 'Meus Projetos',          icone: 'book-outline'     },
    prj:       { titulo: 'Projetos em andamento',  icone: 'bookmark-outline' }
}

export async function buscarProjeto(categoria, id) {
    const lista = await listarProjetos(categoria)
    return lista.find(p => p.id === id) || null
}