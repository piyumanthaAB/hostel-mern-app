import useFetch from './../hooks/useFetch'
import PuffLoader from "react-spinners/PuffLoader";

const RulesRegulations = () => {

    const { data:rules, isPending, isError } = useFetch('/api/v1/rules-regulations');


    return (
        <>
            <div className="rulesRegulationsContainer">
                <h2>Rules and Regulations</h2>
                <p>URL_1 : {data && data.url_1}</p><br />
                <p>URL_2 : {data && data.url_2}</p>
                {isPending && <PuffLoader/>}
                
                {rules &&
                    <ol>
                    {rules.data.rulesRegulations.map(rule => {
                        return (
                            <li key={rule._id}><p className="text-muted">{rule.description}</p></li>
                            )
                        })}
                    
                    </ol>
                }
                

            </div>
        </>
    );
}
 
export default RulesRegulations;