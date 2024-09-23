import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';

const Healthcare = () => {
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [contract, setContract] = useState(null);
    const [account, setAccount] = useState(null);
    const [isOwner, setIsOwner] = useState(null);
    const [patientID, setPatientID] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [treatment, setTreatment] = useState('');
    const [patientRecords, setPatientRecords] = useState([]);


    const [providerAddress, setProviderAddress] = useState("");
    const contractAddress = "0x2bdb3adb370659e90ec4f4a606946971066a2e5f";

    const contractABI = [
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "patientID",
                    "type": "uint256"
                },
                {
                    "internalType": "string",
                    "name": "patientName",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "diagnosis",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "treatment",
                    "type": "string"
                }
            ],
            "name": "addRecord",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "provider",
                    "type": "address"
                }
            ],
            "name": "authorizeProvider",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "inputs": [],
            "name": "getOwner",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "patientID",
                    "type": "uint256"
                }
            ],
            "name": "getPatientRecords",
            "outputs": [
                {
                    "components": [
                        {
                            "internalType": "uint256",
                            "name": "recordID",
                            "type": "uint256"
                        },
                        {
                            "internalType": "string",
                            "name": "patientName",
                            "type": "string"
                        },
                        {
                            "internalType": "string",
                            "name": "diagnosis",
                            "type": "string"
                        },
                        {
                            "internalType": "string",
                            "name": "treatment",
                            "type": "string"
                        },
                        {
                            "internalType": "uint256",
                            "name": "timestamp",
                            "type": "uint256"
                        }
                    ],
                    "internalType": "struct HealthcareRecords.Record[]",
                    "name": "",
                    "type": "tuple[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ];

    useEffect(() => {
        const connectWallet = async () => {
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                await provider.send('eth_requestAccounts', []);
                const signer = provider.getSigner();
                setProvider(provider);
                setSigner(signer);

                const accountAddress = await signer.getAddress();
                setAccount(accountAddress);

                console.log(accountAddress);

                const contract = new ethers.Contract(contractAddress, contractABI, signer);
                setContract(contract);

                const ownerAddress = await contract.getOwner();

                setIsOwner(accountAddress.toLowerCase() === ownerAddress.toLowerCase());



            } catch (error) {
                console.error("Error connecting to wallet: ", error);
            }

        };
        connectWallet();

    }, []);


    const fetchPatientRecords = async () => {
        if (isOwner) {
            if (!patientID || patientID.trim() === "") {
                alert("Please enter a valid Patient ID.");
                return; // Prevent further execution
            }
            try {
                const records = await contract.getPatientRecords(); // Assuming this is a read-only function
                // Process records
            } catch (error) {
                console.error("Error fetching patient records:", error);
            }
        } else {
            alert("Only contract owner can fetch patient records");
        }
        try {
            const records = await contract.getPatientRecords(patientID);
            console.log(records);
            setPatientRecords(records);

        } catch(error) {
            console.error("Error fetching patient records", error);
        }
    }

    const addRecord = async () => {
            // Check if the user is the owner
    if (isOwner) {
        // Validate recordData (Assuming it's an object and needs specific fields)
        if (!(patientID, "Alice", diagnosis, treatment) || Object.keys(patientID, "Alice", diagnosis, treatment).length === 0) {
            alert("Cannot add an empty patient record. Please provide valid data.");
            return; // Prevent further execution and transaction request
        }

        try {
            const tx = await contract.addPatientRecord(patientID, "Alice", diagnosis, treatment); // This is a state-changing transaction
            await tx.wait();
            alert("Record added successfully");
        } catch (error) {
            console.error("Error adding record:", error);
            alert("An error occurred while adding the patient record.");
        }
    } else {
        alert("Only contract owner can add patient records");
    }
        try {
            const tx = await contract.addRecord(patientID, "Alice", diagnosis, treatment);
            await tx.wait();
            fetchPatientRecords();
            await tx.wait();
            alert(`Provider ${providerAddress} authorized successfully`);

        } catch(error) {
            console.error("Error adding records", error);
        }

    }


    const authorizeProvider = async () => {
        // Check if the user is the owner
    if (isOwner) {
        // Validate providerAddress
        if (!providerAddress || providerAddress.trim() === "") {
            alert("Please provide a valid provider address.");
            return; // Prevent further execution and transaction request
        }

        try {
            // Check if the provider is already authorized
            const isAuthorized = await contract.isProviderAuthorized(providerAddress); // Replace with your actual function to check

            if (isAuthorized) {
                alert(`Provider ${providerAddress} is already authorized.`);
                return; // Prevent further execution
            }

            // Authorize the provider
            const tx = await contract.authorizeProvider(providerAddress);
            await tx.wait();
            alert(`Provider ${providerAddress} authorized successfully`);

        } catch (error) {
            console.error("Error authorizing provider:", error);
            alert("An error occurred while authorizing the provider.");
        }
    } else {
        alert("Only contract owner can call this function");
    }
    }

    return(
        <div className='container'>
            <h1 className = "title">MyHealth Hub</h1>
            {account && <p className='account-info'>Connected Account: {account}</p>}
            {isOwner && <p className='owner-info'>You are the contract owner</p>}

        <div className='grid-container'>

        <div className='form-section grid-item'>
            <h2>Fetch Patient Records</h2>
            <input className='input-field' type='text' placeholder='Enter Patient ID' value={patientID} onChange={(e) => setPatientID(e.target.value)}/>
            <button className='action-button' onClick={fetchPatientRecords}>Fetch Records</button>
        </div>

        <div className="form-section grid-item">
            <h2>Add Patient Record</h2>
            <input className='input-field' type='text' placeholder='Diagnosis' value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)}/>
            <input className='input-field' type='text' placeholder='Treatment' value={treatment} onChange={(e) => setTreatment(e.target.value)}/>
            <button className='action-button' onClick={addRecord}>Add Records</button>

        </div>
        <div className="form-section grid-item">
            <h2>Authorize HealthCare Provider</h2>
            <input className='input-field' type= "text" placeholder='Provider Address' value = {providerAddress} onChange={(e) => setProviderAddress(e.target.value)}/>
            <button className='action-button' onClick={authorizeProvider}>Authorize Provider</button>
        </div>

        <div className='records-section grid-item'>
            <h2>Patient Records</h2>
            {patientRecords.map((record, index) => (
                <div key = {index}>
                    <p id='word'>Record ID: {record.recordID.toNumber()}</p>
                    <p id='word'>Diagnosis: {record.diagnosis}</p>
                    <p id='word'>Treatment: {record.treatment}</p>
                    <p id='word'>Timestamp: {new Date(record.timestamp.toNumber() * 1000).toLocaleString()}</p>
            </div>
            ))}
        </div>

        </div>

        </div>

    )

}

export default Healthcare;
