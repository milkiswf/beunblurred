import { useEffect, useRef, useState } from "react";
import { format } from "timeago.js";

import {
    ChevronLeftIcon,
    ChevronRightIcon,
    MusicalNoteIcon,
    PlusIcon
} from "@heroicons/react/20/solid";

export default function PostComponent({ data }) {
    const [PostData, setPostData] = useState({ ...data });
    const [PostIndex, setPostIndex] = useState(0);
    const [ShowMain, setShowMain] = useState(true);
    const [ShowSecondary, setShowSecondary] = useState(true);
    const RealMojisContainer = useRef(null);

    useEffect(() => {
        if (!RealMojisContainer.current);
        const onScroll = (e) => {
            e.preventDefault();

            RealMojisContainer.current.scrollBy({
                "left": e.deltaY < 0 ? -50 : 50,
            });
        };

        RealMojisContainer.current.addEventListener("wheel", onScroll);
    }, [RealMojisContainer]);

    const fetchLocation = async (postIndex) => {
        const url = new URL("https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode");
        url.searchParams.append("location", `${PostData.posts[postIndex].location.longitude},${PostData.posts[postIndex].location.latitude}`);
        url.searchParams.append("langCode", "us");
        url.searchParams.append("outSR", "");
        url.searchParams.append("forStorage", "false");
        url.searchParams.append("f", "pjson");

        const locationData = await fetch(url).then((res) => res.json());
        const locationName = locationData.address.Match_addr;

        setPostData((prev) => {
            const newData = { ...prev };
            newData.posts[postIndex].location.name = locationName;
            return newData;
        });
    };

    useEffect(() => {
        if (PostData.posts[PostIndex].location && !PostData.posts[PostIndex].location.name) {
            fetchLocation(PostIndex);
        }
    }, [PostIndex]);


    return (<>
        <div
            className={`
                flex flex-col lg:gap-y-6 gap-y-4
                bg-white/5
                relative
                rounded-lg lg:p-6 p-4 min-w-0
            `}
        >
            <div className="flex gap-x-4">
                {
                    PostData.user.profilePicture?.url ?
                        <img
                            src={PostData.user.profilePicture?.url}
                            alt={PostData.user.username}
                            className="w-14 h-14 border-black border-2 rounded-full"
                        />
                        :
                        <div className="w-14 h-14 bg-white/5 relative rounded-full border-full border-black justify-center align-middle flex">
                            <div className="m-auto text-2xl uppercase font-bold">{PostData.user.username.slice(0, 1)}</div>
                        </div>
                }

                <p className="text-sm leading-[1.175] my-auto">
                    <span className="font-semibold">{PostData.user.username}</span>
                    <br />
                    <span className="text-xs text-white/50">
                        Posted {PostData.posts[PostIndex].isLate && "late"} {format(PostData.posts[PostIndex].takenAt)}
                        &nbsp;•&nbsp;
                        {PostData.posts[PostIndex].retakeCounter} retake{PostData.posts[PostIndex].retakeCounter !== 1 && "s"}
                    </span>
                </p>
            </div>

            <div className="relative mx-auto">
                <img
                    src={ShowMain ? PostData.posts[PostIndex].primary.url : PostData.posts[PostIndex].secondary.url}
                    alt={PostData.user.username}
                    className="rounded-lg w-full border-2 border-black aspect-[3/4]"
                    onClick={() => setShowSecondary(!ShowSecondary)}
                />

                <img
                    src={ShowMain ? PostData.posts[PostIndex].secondary.url : PostData.posts[PostIndex].primary.url}
                    alt={PostData.user.username}
                    className={`
                        rounded-lg absolute top-4 left-4 w-[35%] border-2 border-black aspect-[3/4]
                        ${!ShowSecondary ? "hidden" : "block"}
                    `}
                    onClick={() => setShowMain(!ShowMain)}
                />

                <div
                    className={`
                        absolute right-2 inset-y-0 flex
                        ${(!ShowSecondary || PostData.posts.length == 1) ? "hidden" : "block"}
                    `}
                >
                    <button
                        className={`
                            m-auto bg-white rounded-lg py-4 px-1
                            disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                        disabled={PostIndex === PostData.posts.length - 1}
                        onClick={() => setPostIndex(PostIndex + 1)}
                    >
                        <ChevronRightIcon className="w-6 h-6 text-black m-auto" />
                    </button>
                </div>

                <div
                    className={`
                        absolute left-2 inset-y-0 flex
                        ${(!ShowSecondary || PostData.posts.length == 1) ? "hidden" : "block"}
                    `}
                >
                    <button
                        className={`
                            m-auto bg-white rounded-lg py-4 px-1
                            disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                        disabled={PostIndex === 0}
                        onClick={() => setPostIndex(PostIndex - 1)}
                    >
                        <ChevronLeftIcon className="w-6 h-6 text-black m-auto" />
                    </button>
                </div>
            </div>

            {
                PostData.posts[PostIndex].music &&
                <div
                    className={`
                        bg-gradient-to-r from-[#FF0080] to-[#7928CA]
                        rounded-lg cursor-pointer border-2 border-black
                    `}
                    style={{
                        backgroundImage: `url(${PostData.posts[PostIndex].music?.artwork})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                    onClick={() => {
                        const audio = document.getElementById(`audio-${PostData.posts[PostIndex].id}`);
                        if (audio.paused) {
                            audio.play();
                        } else {
                            audio.pause();
                        }
                    }}
                >
                    <audio
                        src={PostData.posts[PostIndex].music?.preview}
                        id={`audio-${PostData.posts[PostIndex].id}`}
                        loop
                    />
                    <div
                        className="bg-black/50 p-4 rounded backdrop-blur"
                    >
                        <p className="text-sm text-white text-center">
                            <MusicalNoteIcon className="h-4 w-4 mr-1 inline-flex" /> <span className="font-medium">{PostData.posts[PostIndex].music?.track}</span>
                        </p>
                    </div>
                </div>
            }

            {
                PostData.posts[PostIndex].location &&
                <a
                    href={`https://www.google.com/maps/search/?api=1&query=${PostData.posts[PostIndex].location.latitude},${PostData.posts[PostIndex].location.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                >
                    <div className="bg-white/5 rounded-lg cursor-pointer p-2">
                        <p className="text-sm text-white text-center">
                            {PostData.posts[PostIndex].location.name || "Open on Google Maps"}
                        </p>
                    </div>
                </a>
            }

            <div
                ref={RealMojisContainer}
                className="flex gap-x-6 overflow-x-auto scrollbar-hide max-w-max items-center"
            >
                {
                    PostData.posts[PostIndex].realMojis.map((realmoji, index) => (
                        <div
                            key={index}
                            className="w-20"
                        >
                            <div className="relative w-20 h-20">
                                <img
                                    src={realmoji.media.url}
                                    alt={`${PostData.user.username} realmoji's`}
                                    title={`Reacted ${format(realmoji.postedAt)}`}
                                    className="rounded-full border-2 border-white/50 aspect-square"
                                />

                                <span className="absolute text-4xl -bottom-2 -right-4">
                                    {realmoji.emoji}
                                </span>
                            </div>

                            <p className="text-sm text-center mt-2 truncate text-ellipsis overflow-hidden whitespace-nowrap">
                                {realmoji.user.username}
                            </p>
                        </div>
                    ))
                }

                {/* <div>
                    <div
                        className={`
                            w-20 h-20 rounded-full border-2 border-current aspect-square
                            flex items-center justify-center text-white/50 hover:text-white/75 transition-colors
                            cursor-pointer
                        `}
                    >
                        <PlusIcon className="w-8 h-8 text-current" />
                    </div>
                    <p className="text-sm font-medium text-center mt-2 break-words text-white/75">
                        React
                    </p>
                </div> */}
            </div>
        </div>
    </>);
}