import { ArrowUpRight, Clock3, MapPin, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Box, Business } from '../types';
import { azn, time } from '../format';

export default function BoxCard({box,business}:{box:Box;business:Business}) {
  const discount = Math.round((1-box.price/box.originalPrice)*100);
  return <Link to={`/box/${box.id}`} className="box-card">
    <div className="box-image"><img src={box.image} alt={box.title} loading="lazy" /><span className="discount-badge">-{discount}%</span><span className="image-arrow"><ArrowUpRight size={16}/></span></div>
    <div className="box-body"><div className="box-business">{business.name} <span><Star size={13} fill="currentColor"/> {business.rating.toFixed(1)}</span></div><h3>{box.title}</h3><div className="box-meta"><span><MapPin size={14}/>{box.distance.toFixed(1)} km</span><span><Clock3 size={14}/>{time(box.pickupStart)} – {time(box.pickupEnd)}</span></div><div className="box-bottom"><div><strong>{azn(box.price)}</strong><del>{azn(box.originalPrice)}</del></div><span className={box.quantity<=3?'left-tag urgent':'left-tag'}>{box.quantity} qutu qaldı</span></div></div>
  </Link>;
}
