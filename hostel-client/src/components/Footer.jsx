import logo from './../images/UOR-logo.png'

const Footer = () => {
    return (
        <>
            <div className="FooterContainer">
                
                <div>
                    <img className="footerLogo" src={logo} alt="" />
                </div>
                <h3 className="footerH3">University of Ruhuna</h3>
                <p className="footerH3">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Voluptatibus, totam? Nulla neque voluptates provident, magnam necessitatibus sapiente nihil voluptate doloribus beatae vitae cupiditate excepturi consequuntur? Veniam mollitia iusto voluptatem optio!</p>

            </div>
        </>
     );
}
 
export default Footer;