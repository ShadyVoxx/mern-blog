import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import Editor from "../components/editor";
import { useParams } from "react-router-dom";

const EditPost = () => {
    const { id } = useParams(); // Corrected: useParams() is a function
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [content, setContent] = useState('');
    const [files, setFiles] = useState('');
    const [redirect, setRedirect] = useState(false);

    useEffect(() => {
        fetch(`http://localhost:4000/post/${id}`)
            .then(response => {
                response.json().then(postInfo => {
                    setTitle(postInfo.title);
                    setContent(postInfo.content);
                    setSummary(postInfo.summary);
                });
            });
    }, [id]);

    async function updatePost(ev) {
        ev.preventDefault();
        const data = new FormData();
        data.set('title',title);
        data.set('summary',summary);
        data.set('content',content);

        data.set('id',id);
        if (files?.[0]){
            data.set('file',files?.[0]);
        }

        const response = await fetch('http://localhost:4000/post',{
            method: 'PUT',
            body: data,
            credentials: 'include'
        })
        if (response.ok){
            setRedirect(true);
        }

    }

    if (redirect) {
        return <Navigate to={'/post/'+id} />;
    }

    return (
        <form onSubmit={updatePost}>
            <input type="title" placeholder={`Title`} value={title} onChange={e => setTitle(e.target.value)} />
            <input type="summary" placeholder={`Summary`} value={summary} onChange={e => setSummary(e.target.value)} />
            <input type="file" onChange={ev => setFiles(ev.target.files)} />
            <Editor onChange={setContent} value={content} />
            <button style={{ marginTop: '5px' }}>Create Post</button>
        </form>
    );
}

export default EditPost;
