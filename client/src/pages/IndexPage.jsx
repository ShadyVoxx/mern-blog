import Post from "../components/post";
import { useEffect, useState } from "react";

const IndexPage = () =>{
    const [posts,setPosts] = useState([]);
    useEffect(() => {
      fetch('http://localhost:4000/post').then(response => {
        response.json().then(posts => {
          setPosts(posts);
        });
      });
    }, []);
    return (
        <div>
            <>
                {posts.length > 0 && posts.map(post => (
                    <Post key={post.id} {...post}/> 
                ))}
            </>
        </div>
    )
}

export default IndexPage;