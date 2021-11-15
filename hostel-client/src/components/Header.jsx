import { Navbar, Nav, Container } from "react-bootstrap";
import logo from './../images/UOR-logo.png'
import {  Link } from 'react-router-dom';
const Header = () => {
    return (
        <>
            <Navbar bg="info" variant="dark">
                <Container>
                    <Navbar.Brand as={Link} to="/" >
                        <div>
                            {/* <img src={logo} alt="image" /> */}
                        </div>
                        University of Ruhuna <br /> Hostel Management System
                    </Navbar.Brand>
                    <Nav className="ml-auto">
                        <Nav.Link as={Link} to="/">Home</Nav.Link>
                        <Nav.Link as={Link} to="/facilities">Facilities</Nav.Link>
                        <Nav.Link as={Link} to="/rules-&-regulations">Rules & Regulations</Nav.Link>
                        <Nav.Link as={Link} to="/maintenance">Maintenance</Nav.Link>
                        <Nav.Link as={Link} to="/contact">Contact</Nav.Link>
                    </Nav>

                </Container>
            </Navbar>
        </>
    );
}
 
export default Header;