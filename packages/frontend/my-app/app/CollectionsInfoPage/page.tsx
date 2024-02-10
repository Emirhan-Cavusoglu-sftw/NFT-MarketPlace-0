import react from "react";
import Image from "next/image";

const CollectionsInfoPage = () => {
  return (
    <div>
      <div className="p-10 mt-24 pb-80 ">
        <Image
          src="/İTÜ Blockchain.png"
          alt=""
          width={150}
          height={150}
        ></Image>
        <div className="font-bold text-2xl text-white mt-6">İtü Blockchain</div>
        <div className="font-bold text-white mt-14">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Saepe tempore consectetur sapiente exercitationem unde culpa odit quaerat ullam aspernatur tenetur impedit dolores non cupiditate, libero assumenda obcaecati ipsum possimus rerum.</div>
      </div>
    </div>
  );
};

export default CollectionsInfoPage;


//koleksiyonun total fiyatı, koleksiyondaki nftler, koleksiyon sahibi, koleksiyonun adı, koleksiyonın resmi, koleksiyonun açıklaması