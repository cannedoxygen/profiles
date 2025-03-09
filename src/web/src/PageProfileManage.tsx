import { useCurrentAccount, useSignTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { create_profile, update_profile } from "../../sdk/src/package.js";
import { formatXHandle, isValidTardinatorName } from "../../sdk/src/functions.js";
import { LinkToPolymedia } from "@polymedia/suitcase-react";
import { SyntheticEvent, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { AppContext } from "./App";
import { notifyError, notifyOkay } from "./components/Notification";
import "./styles/ProfileCreation.less";

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
    const [inputXHandle, setInputXHandle] = useState("");
    const [inputTelegramHandle, setInputTelegramHandle] = useState("");
    
    // Form validation
    const [isNameAvailable, setIsNameAvailable] = useState<boolean | null>(null);
    const [nameError, setNameError] = useState<string | null>(null);
    const [isErrorImage, setIsErrorImage] = useState(false);
    const [isErrorForm, setIsErrorForm] = useState(false);
    const [isErrorImgur, setIsErrorImgur] = useState(false);
    
    // Other state
    const [waiting, setWaiting] = useState(false);

    /* Functions */
    useEffect(() => {
        document.title = "Tardinator Profile - Manage";
    }, []);

    // Update form when profile changes
    useEffect(() => {
        if (profile) {
            setInputName(profile.name);
            setInputImage(profile.imageUrl);
            setInputDescription(profile.description);
            setInputXHandle(profile.xHandle);
            setInputTelegramHandle(profile.telegramHandle);
        }
    }, [profile]);

    // Check name availability when input changes (only for new profiles)
    useEffect(() => {
        // Only check availability if creating a new profile
        if (profile !== null) return;
        
        const checkNameAvailability = async () => {
            if (!inputName || inputName.length < 3) {
                setIsNameAvailable(null);
                setNameError(null);
                return;
            }

            if (!isValidTardinatorName(inputName)) {
                setIsNameAvailable(false);
                setNameError("Username must be 3-20 characters, alphanumeric with underscores only, and can't start with a number");
                return;
            }

            try {
                setWaiting(true);
                const available = await profileClient.isNameAvailable(inputName);
                setIsNameAvailable(available);
                setNameError(available ? null : "This username is already taken");
            } catch (err) {
                console.error("Error checking name availability:", err);
                setNameError("Error checking name availability");
                setIsNameAvailable(null);
            } finally {
                setWaiting(false);
            }
        };

        const timeoutId = setTimeout(checkNameAvailability, 500);
        return () => clearTimeout(timeoutId);
    }, [inputName, profileClient, profile]);

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

    const onSubmitCreateProfile = async (e: SyntheticEvent) => {
        e.preventDefault();
        if (!currentAccount) {
            openConnectModal();
            return;
        }

        // Validate form for new profile
        if (!isNameAvailable || nameError) {
            notifyError("Please fix the username issues before creating your profile");
            return;
        }

        console.debug(`[onSubmitCreateProfile] Attempting to create profile: ${inputName}`);
        setWaiting(true);
        
        try {
            const tx = new Transaction();
            create_profile(
                tx,
                profileClient.packageId,
                profileClient.registryId,
                inputName,
                inputImage,
                inputDescription,
                formatXHandle(inputXHandle),
                inputTelegramHandle,
                null,
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
                notifyError(`Txn digest: ${resp.digest}\n`
                    + `Txn status: ${resp.effects?.status.status}\n`
                    + `Txn errors: ${JSON.stringify(resp.errors)}`);
            } else {
                notifyOkay("Profile created successfully!");
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
            update_profile(
                tx,
                profile.id,
                profileClient.packageId,
                inputImage,
                inputDescription,
                formatXHandle(inputXHandle),
                inputTelegramHandle,
                null,
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
                notifyError(`Txn digest: ${resp.digest}\n`
                    + `Txn status: ${resp.effects?.status.status}\n`
                    + `Txn errors: ${JSON.stringify(resp.errors)}`);
            } else {
                notifyOkay("Profile updated successfully!");
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
                Connect your Sui wallet to manage your Tardinator profile.<br/>It's free and only takes a few seconds!
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
        // The form changes slightly based on whether we're creating or editing
        const isCreating = profile === null;
        
        view = <form className="form" onSubmit={isCreating ? onSubmitCreateProfile : onSubmitEditProfile}>
            <div className="form-field">
                <label>Username {isCreating && '*'}</label>
                <input 
                    value={inputName} 
                    type="text" 
                    required={isCreating}
                    maxLength={20}
                    className={waiting ? "waiting" : nameError ? "error" : isNameAvailable ? "success" : ""}
                    disabled={waiting || !isCreating} // Can't change username after creation
                    spellCheck="false" 
                    autoCorrect="off" 
                    autoComplete="off"
                    onChange={e => setInputName(e.target.value)}
                />
                {isCreating && nameError && <div className="field-error">{nameError}</div>}
                {isCreating && isNameAvailable && <div className="field-success">Username is available!</div>}
                {isCreating && <div className="field-info">Choose a unique username (3-20 characters, letters, numbers, and underscores only)</div>}
                {!isCreating && <div className="field-info">Usernames cannot be changed after creation</div>}
            </div>
            
            <div className="form-field">
                <label>Profile Image URL<span className="field-optional">[optional]</span></label>
                <input 
                    value={inputImage} 
                    type="text"
                    className={waiting ? "waiting" : ""}
                    disabled={waiting}
                    spellCheck="false" 
                    autoCorrect="off" 
                    autoComplete="off"
                    onChange={onInputImageChange}
                />
                {isErrorImage && <div className="field-error">That doesn't look like a valid image URL</div>}
                <div className="field-info">Right click the image, then click 'Copy Image Address'. To use a picture from your device, upload it to a service like <a href="https://imgur.com/upload" target="_blank" rel="noopener nofollow noreferrer">imgur.com</a>, then copy the image address.</div>
                {isErrorImgur && <div className="field-error-imgur"><img src="/img/drake.webp" /></div>}
            </div>
            
            <div className="form-field">
                <label>Description<span className="field-optional">[optional]</span></label>
                <textarea 
                    value={inputDescription} 
                    maxLength={500}
                    className={waiting ? "waiting" : ""}
                    disabled={waiting}
                    spellCheck="true" 
                    autoCorrect="off" 
                    autoComplete="off"
                    onChange={e => setInputDescription(e.target.value)}
                />
                <div className="char-count">{inputDescription.length}/500</div>
            </div>
            
            <div className="form-field">
                <label>X/Twitter Handle<span className="field-optional">[optional]</span></label>
                <div className="input-with-prefix">
                    <span className="input-prefix">@</span>
                    <input 
                        value={inputXHandle.startsWith('@') ? inputXHandle.substring(1) : inputXHandle} 
                        type="text"
                        className={waiting ? "waiting" : ""}
                        disabled={waiting}
                        spellCheck="false" 
                        autoCorrect="off" 
                        autoComplete="off"
                        onChange={e => setInputXHandle(e.target.value)}
                    />
                </div>
            </div>
            
            <div className="form-field">
                <label>Telegram Handle<span className="field-optional">[optional]</span></label>
                <div className="input-with-prefix">
                    <span className="input-prefix">@</span>
                    <input 
                        value={inputTelegramHandle.startsWith('@') ? inputTelegramHandle.substring(1) : inputTelegramHandle} 
                        type="text"
                        className={waiting ? "waiting" : ""}
                        disabled={waiting}
                        spellCheck="false" 
                        autoCorrect="off" 
                        autoComplete="off"
                        onChange={e => setInputTelegramHandle(e.target.value)}
                    />
                </div>
            </div>
            
            <button
                type="submit"
                disabled={waiting || isErrorForm || (isCreating && !isNameAvailable)}
                className={isErrorForm || (isCreating && !isNameAvailable) ? "disabled" : (waiting ? "waiting" : "")}
            >
                {isCreating ? "CREATE PROFILE" : "UPDATE PROFILE"}
            </button>
            {isErrorForm && <div className="field-error">Please fix the form errors</div>}
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