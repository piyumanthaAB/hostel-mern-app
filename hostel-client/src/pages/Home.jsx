import { Container,Button } from "react-bootstrap";
import ImageList from './../components/ImageList';
import useFetch from './../hooks/useFetch'
import PuffLoader from "react-spinners/PuffLoader";
import {  Link } from 'react-router-dom';

const Home = () => {

    const { data:images, isPending, isError } = useFetch('/api/v1/gallery-images');

    return (
        <>
            <div className="homeCover">
                {/* <img className="homeCover__img" src={uniCover} alt="" /> */}
                <p>Welcome to Hostel Management</p>
            </div>
            <div className="hostelFacilities">
                <Container>
                    <h3>Hostel Facilities</h3>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Officia, dolores facilis. Blanditiis,
                        optio cumque? Deleniti tenetur vel rem architecto in dolore, aliquid iusto cupiditate, vero dolor
                        qui molestias expedita nihil.
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Officia, dolores facilis. Blanditiis,
                        optio cumque? Deleniti tenetur vel rem architecto in dolore, aliquid iusto cupiditate, vero dolor
                        qui molestias expedita nihil.
                    </p>
                    <p>Contrary to popular belief, Lorem Ipsum is not simply random text.
                        It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance.
                        The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.
                    </p>
                </Container>
                <div className="imageListDiv">
                    {isPending && <PuffLoader/>}
                    {images && <ImageList itemData={ images}/>}
                </div>
            </div>
            <div className="rulesRegulations">
                <Container>
                    <h3>Rules and Regulations</h3>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Officia, dolores facilis. Blanditiis,
                        optio cumque? Deleniti tenetur vel rem architecto in dolore, aliquid iusto cupiditate, vero dolor
                        qui molestias expedita nihil.
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Officia, dolores facilis. Blanditiis,
                        optio cumque? Deleniti tenetur vel rem architecto in dolore, aliquid iusto cupiditate, vero dolor
                        qui molestias expedita nihil.
                    </p>
                    <p>Contrary to popular belief, Lorem Ipsum is not simply random text.
                        It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance.
                        The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.
                    </p>
                    <Button as={Link} to="/rules-&-regulations" variant="info">Read More ...</Button>
                </Container>
                
            </div>
        </>
     );
}
 
export default Home;