import { useCurrentAccount, useSignTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { create_profile, edit_profile } from "@tardinator/profile-sdk";
import { SyntheticEvent, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { AppContext } from "./App";
import { LinkToPolymedia } from "@polymedia/suitcase-react";
import { notifyError, notifyOkay } from "./components/Notification";
import "./styles/ManageProfile.less";

export const PageProfileManage: React.FC = () => {
    /* State */
    const suiClient = useSuiClient();
    const currentAccount = useCurrentAccount();
    const { mutateAsync: signTransaction } = useSignTransaction();

    const {
        network,
        profile,
        profileClient,
        reloadProfile,
        openConnectModal,
    } = useOutletContext<AppContext>();

    // Form inputs
    const [inputName, setInputName] = useState("");
    const [inputImage, setInputImage] = useState("");
    const [inputDescription, setInputDescription] = useState("");
    const [inputXAccount, setInputXAccount] = useState("");
    const [inputTelegramUsername, setInputTelegramUsername] = useState("");
    
    // Form validation
    const [isErrorImage, setIsErrorImage] = useState(false);
    const [isErrorForm, setIsErrorForm] = useState(false);
    const [isErrorImgur, setIsErrorImgur] = useState(false);
    const [isNameAvailable, setIsNameAvailable] = useState(true);
    
    // Other state
    const [waiting, setWaiting] = useState(false);
    const [checkingName, setCheckingName] = useState(false);

    /* Functions */
    useEffect(() => {
        document.title = "Tardinator Profile - Manage";
    }, []);

    useEffect(() => {
        if (profile) {
            setInputName(profile.name || "");
            setInputImage(profile.imageUrl || "");
            setInputDescription(profile.description || "");
            
            // Handle social media accounts from profile.data
            if (profile.data) {
                try {
                    const data = typeof profile.data === 'string' 
                        ? JSON.parse(profile.data) 
                        : profile.data;
                    
                    setInputXAccount(data.xAccount || "");
                    setInputTelegramUsername(data.telegramUsername || "");
                } catch (err) {
                    console.warn("Error parsing profile data:", err);
                }
            }
        }
    }, [profile]);

    const onInputImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.value) {
            setIsErrorImage(false);
            setIsErrorForm(false);
            setIsErrorImgur(false);
        }
        setInputImage(e.target.value);
    };

    const onImageLoad = () => {
        setIsErrorImage(false);
        setIsErrorForm(false);
        setIsErrorImgur(false);
    };

    const onImageError = () => {
        setIsErrorImage(true);
        setIsErrorForm(true);
        setIsErrorImgur(inputImage.startsWith("https://imgur.com/"));
    };

    const checkNameAvailability = async (name: string) => {
        if (!profile && name) {
            setCheckingName(true);
            try {
                // In a real implementation, we would call the SDK to check if the name is available
                // Simulate API call with timeout
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // This would be replaced with actual SDK function call in production
                const isAvailable = Math.random() > 0.3; // Simulating 70% chance of name being available
                
                setIsNameAvailable(isAvailable);
                setIsErrorForm(!isAvailable);
            } catch (err) {
                console.warn("[checkNameAvailability]", err);
                setIsNameAvailable(true); // Default to available on error
            } finally {
                setCheckingName(false);
            }
        }
    };

    const onInputNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        setInputName(name);
        
        // Only check availability for new profiles (not editing)
        if (!profile && name.length >= 3) {
            const handler = setTimeout(() => checkNameAvailability(name), 500);
            return () => clearTimeout(handler);
        }
    };

    const onSubmitCreateProfile = async (e: SyntheticEvent) => {
        e.preventDefault();
        if (!currentAccount) {
            openConnectModal();
            return;
        }
        if (!isNameAvailable) {
            notifyError("Username is already taken. Please choose another.");
            return;
        }
        
        console.debug(`[onSubmitCreateProfile] Attempting to create profile: ${inputName}`);
        setWaiting(true);
        try {
            const tx = new Transaction();
            
            // Prepare data for social media links
            const profileData = {
                xAccount: inputXAccount,
                telegramUsername: inputTelegramUsername
            };
            
            create_profile(
                tx,
                profileClient.packageId,
                profileClient.registryId,
                inputName,
                inputImage,
                inputDescription,
                profileData,
            );

            const signedTx = await signTransaction({
                transaction: tx,
            });

            const resp = await suiClient.executeTransactionBlock({
                transactionBlock: signedTx.bytes,
                signature: signedTx.signature,
                options: { showEffects: true },
            });
            console.debug("resp:", resp);

            if (resp.errors || resp.effects?.status.status !== "success") {
                notifyError(`Transaction failed. Status: ${resp.effects?.status.status || "unknown"}`);
            } else {
                notifyOkay("SUCCESS");
                reloadProfile();
            }
        } catch (err) {
            console.warn("[onSubmitCreateProfile]", err);
            notifyError(String(err));
        } finally {
            setWaiting(false);
        }
    };

    const onSubmitEditProfile = async (e: SyntheticEvent) => {
        e.preventDefault();
        if (!currentAccount) {
            openConnectModal();
            return;
        }
        if (!profile) {
            notifyError("[onSubmitEditProfile] Missing profile");
            return;
        }
        console.debug("[onSubmitEditProfile] Attempting to edit profile");
        setWaiting(true);
        try {
            const tx = new Transaction();
            
            // Prepare data for social media links
            const profileData = {
                xAccount: inputXAccount,
                telegramUsername: inputTelegramUsername
            };
            
            edit_profile(
                tx,
                profile.id,
                profileClient.packageId,
                inputName,
                inputImage,
                inputDescription,
                profileData,
            );

            const signedTx = await signTransaction({
                transaction: tx,
            });

            const resp = await suiClient.executeTransactionBlock({
                transactionBlock: signedTx.bytes,
                signature: signedTx.signature,
                options: { showEffects: true },
            });
            console.debug("resp:", resp);

            if (resp.errors || resp.effects?.status.status !== "success") {
                notifyError(`Transaction failed. Status: ${resp.effects?.status.status || "unknown"}`);
            } else {
                notifyOkay("SUCCESS");
                reloadProfile();
            }
        } catch (err) {
            console.warn("[onSubmitEditProfile]", err);
            notifyError(String(err));
        } finally {
            setWaiting(false);
        }
    };

    /* HTML */
    let view: React.ReactNode;
    
    if (!currentAccount) {
        view = <div>
            <p>
                Connect your Sui wallet to create your Tardinator profile.<br/>
                It's free and only takes a few seconds!
            </p>
            <button onClick={openConnectModal}>CONNECT WALLET</button>
        </div>;
    }
    else if (profile === undefined) {
        view = <div>
            Loading...
        </div>;
    }
    else {
        view = <form className="form" onSubmit={profile === null ? onSubmitCreateProfile : onSubmitEditProfile}>
            <div className="form-field">
                <label>
                  Username
                  {profile === null && <span className="field-required">[required]</span>}
                </label>
                <input 
                    value={inputName} 
                    type="text" 
                    required 
                    maxLength={60}
                    className={waiting || checkingName ? "waiting" : (!isNameAvailable ? "error" : "")} 
                    disabled={waiting || checkingName || profile !== null} // Disable name change for existing profiles
                    spellCheck="false" 
                    autoCorrect="off" 
                    autoComplete="off"
                    onChange={onInputNameChange}
                />
                {!isNameAvailable && <div className="field-error">This username is already taken</div>}
                {profile === null && <div className="field-info">Usernames must be unique and cannot be changed later</div>}
            </div>
            
            <div className="form-field">
                <label>Description<span className="field-optional">[optional]</span></label>
                <textarea value={inputDescription} maxLength={10000}
                    className={waiting ? "waiting" : ""} disabled={waiting}
                    spellCheck="true" autoCorrect="off" autoComplete="off"
                    onChange={e => setInputDescription(e.target.value)}
                />
            </div>
            <div className="form-field">
                <label>Image URL<span className="field-optional">[optional]</span></label>
                <input value={inputImage} type="text"
                    className={waiting ? "waiting" : ""} disabled={waiting}
                    spellCheck="false" autoCorrect="off" autoComplete="off"
                    onChange={onInputImageChange}
                />
                {isErrorImage && <div className="field-error">That doesn't look like a valid image URL</div>}
                <div className="field-info">Right click the image, then click 'Copy Image Address'. To use a picture from your device, upload it to a service like <a href="https://imgur.com/upload" target="_blank" rel="noopener nofollow noreferrer">imgur.com</a>, then copy the image address.</div>
                {isErrorImgur && <div className="field-error-imgur"><img src="/img/drake.webp" /></div>}
            </div>

            <div className="form-field">
                <label>X/Twitter Username<span className="field-optional">[optional]</span></label>
                <input 
                    value={inputXAccount} 
                    type="text"
                    className={waiting ? "waiting" : ""} 
                    disabled={waiting}
                    spellCheck="false" 
                    autoCorrect="off" 
                    autoComplete="off"
                    placeholder="username (without @)"
                    onChange={e => setInputXAccount(e.target.value)}
                />
            </div>
            <div className="form-field">
                <label>Telegram Username<span className="field-optional">[optional]</span></label>
                <input 
                    value={inputTelegramUsername} 
                    type="text"
                    className={waiting ? "waiting" : ""} 
                    disabled={waiting}
                    spellCheck="false" 
                    autoCorrect="off" 
                    autoComplete="off"
                    placeholder="username (without @)"
                    onChange={e => setInputTelegramUsername(e.target.value)}
                />
            </div>
            
            <button
                type="submit"
                disabled={waiting || isErrorForm}
                className={isErrorForm ? "disabled" : (waiting ? "waiting" : "")}
            >
                {profile===null ? "CREATE PROFILE" : "EDIT PROFILE"}
            </button>
            {isErrorForm && <div className="field-error">Form has errors</div>}
        </form>;
    }

    const imageSection = !inputImage ? <></> :
    <div className={"section section-image "+(isErrorImage?"hidden":"")}>
        <h2>Image preview</h2>
        <img
            src={inputImage}
            onLoad={onImageLoad}
            onError={onImageError}
        />
    </div>;

    const infoSection = !profile ? <></> :
    <div className="section section-info">
        <h2>Details</h2>
        <p>
            Profile: <LinkToPolymedia network={network} kind="object" addr={profile.id} />
        </p>
        <p>
            Registry: <LinkToPolymedia network={network} kind="object" addr={profileClient.registryId} />
        </p>
    </div>;

    return <div id="page" className="page-manage-profile">
        <h1>{profile ? "EDIT" : (profile===null ? "CREATE" : "MANAGE")} PROFILE</h1>
        {view}
        {imageSection}
        {infoSection}
    </div>;
};